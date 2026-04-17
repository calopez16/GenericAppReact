import { useCallback, useState, useEffect, useRef, useContext } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Avatar,
    Typography,
    IconButton,
    Tooltip,
    Divider,
    Chip,
    CircularProgress,
    useTheme,
    Select,
    MenuItem,
    Popover,
    Paper,
    Collapse,
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import TableChartIcon from '@mui/icons-material/TableChart';
import ImageIcon from '@mui/icons-material/Image';
import CodeIcon from '@mui/icons-material/Code';
// Table-operation icons
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import BorderAllIcon from '@mui/icons-material/BorderAll';
import BorderClearIcon from '@mui/icons-material/BorderClear';
import BorderStyleIcon from '@mui/icons-material/BorderStyle';
import TableRowsIcon from '@mui/icons-material/TableRows';
import { AppContext } from '@helpers/AppContext';
import { useEditor, EditorContent } from '@tiptap/react';
import { Node, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Color, FontFamily, FontSize, TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Table as TiptapTable, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';

// ---------------------------------------------------------------------------
// Extended Table: tracks `borderless` state + exposes toggleTableBorders command
// ---------------------------------------------------------------------------
const Table = TiptapTable.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            borderless: {
                default: false,
                parseHTML: element => element.getAttribute('data-borderless') === 'true',
                renderHTML: attributes => attributes.borderless ? { 'data-borderless': 'true' } : {},
            },
        };
    },
    addCommands() {
        return {
            ...this.parent?.(),
            toggleTableBorders: () => ({ tr, state, dispatch }) => {
                const { $from } = state.selection;
                let tableDepth = -1;
                for (let d = $from.depth; d >= 0; d--) {
                    if ($from.node(d).type.name === 'table') { tableDepth = d; break; }
                }
                if (tableDepth === -1) return false;
                const tablePos = $from.before(tableDepth);
                const tableNode = $from.node(tableDepth);
                const borderless = !tableNode.attrs.borderless;
                tr.setNodeMarkup(tablePos, undefined, { ...tableNode.attrs, borderless });
                tableNode.descendants((node, pos) => {
                    if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
                        tr.setNodeMarkup(tablePos + 1 + pos, undefined, { ...node.attrs, borderless });
                    }
                });
                if (dispatch) dispatch(tr);
                return true;
            },
        };
    },
});

// ---------------------------------------------------------------------------
// TableCell / TableHeader extended with inline `style` when borderless
// ---------------------------------------------------------------------------
const BorderlessTableCell = TableCell.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            borderless: {
                default: false,
                parseHTML: element => element.getAttribute('data-borderless') === 'true',
                renderHTML: (attributes) => {
                    if (!attributes.borderless) return {};
                    return { 'data-borderless': 'true', style: 'border: none;' };
                },
            },
        };
    },
});

const BorderlessTableHeader = TableHeader.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            borderless: {
                default: false,
                parseHTML: element => element.getAttribute('data-borderless') === 'true',
                renderHTML: (attributes) => {
                    if (!attributes.borderless) return {};
                    return { 'data-borderless': 'true', style: 'border: none; background: transparent;' };
                },
            },
        };
    },
});
import Image from '@tiptap/extension-image';

// ---------------------------------------------------------------------------
// Extended Image node with horizontal alignment (left / center / right)
// ---------------------------------------------------------------------------
const AlignableImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            textAlign: {
                default: 'left',
                parseHTML: element => element.getAttribute('data-align') ?? 'left',
                renderHTML: attributes => {
                    const align = attributes.textAlign ?? 'left';
                    const marginMap = { left: '4px 0', center: '4px auto', right: '4px 0 4px auto' };
                    return {
                        'data-align': align,
                        style: `display: block; margin: ${marginMap[align] ?? '4px 0'}`,
                    };
                },
            },
        };
    },
    addCommands() {
        return {
            ...this.parent?.(),
            setImageAlign: (align) => ({ commands }) =>
                commands.updateAttributes(this.name, { textAlign: align }),
        };
    },
});

import { DataAPIContractTemplatesService } from '@data/ContractTemplates/Data';
import { AVAILABLE_VARIABLES } from '@data/ContractTemplates/Variables';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';

// ---------------------------------------------------------------------------
// Custom inline Node: renders {{variable}} as a styled non-editable atom
// ---------------------------------------------------------------------------
const TemplateVariable = Node.create({
    name: 'templateVariable',
    group: 'inline',
    inline: true,
    atom: true,

    addAttributes() {
        return { key: { default: null } };
    },

    parseHTML() {
        return [{ tag: 'span[data-variable]' }];
    },

    renderHTML({ node, HTMLAttributes }) {
        return [
            'span',
            mergeAttributes(HTMLAttributes, {
                'data-variable': node.attrs.key,
                class: 'tiptap-variable',
                contenteditable: 'false',
            }),
            node.attrs.key,
        ];
    },

    addCommands() {
        return {
            insertVariable:
                (key) =>
                ({ chain }) =>
                    chain()
                        .insertContent({ type: this.name, attrs: { key } })
                        .insertContent(' ')
                        .run(),
        };
    },
});

// ---------------------------------------------------------------------------
// Shared toolbar button style
// ---------------------------------------------------------------------------
const useBtnSx = (active) => ({
    border: '1px solid',
    borderColor: active ? 'primary.main' : 'divider',
    borderRadius: 1,
    color: active ? 'primary.main' : 'text.secondary',
    bgcolor: active ? 'action.selected' : 'transparent',
    p: 0.5,
    minWidth: 0,
    '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.light' },
    transition: 'all 0.15s',
});

const ToolbarDivider = () => (
    <Box sx={{ width: '1px', height: 22, bgcolor: 'divider', mx: 0.25, flexShrink: 0 }} />
);

// ---------------------------------------------------------------------------
// Toolbar — scoped to this file
// ---------------------------------------------------------------------------
const EditorToolbar = ({ editor, t }) => {
    const imageInputRef = useRef(null);
    const [colorAnchor, setColorAnchor] = useState(null);

    if (!editor) return null;

    // ?? Heading / paragraph select ??????????????????????????????????????????
    const headingValue = editor.isActive('heading', { level: 1 }) ? 'h1'
        : editor.isActive('heading', { level: 2 }) ? 'h2'
        : editor.isActive('heading', { level: 3 }) ? 'h3'
        : 'p';

    const handleHeadingChange = (e) => {
        const v = e.target.value;
        if (v === 'p') editor.chain().focus().setParagraph().run();
        else editor.chain().focus().setHeading({ level: Number(v[1]) }).run();
    };

    // -- Font-size select --
    const FONT_SIZES = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px'];
    const activeFontSize = editor.getAttributes('textStyle').fontSize ?? '14px';

    // -- Font-family select --
    const FONT_FAMILIES = [
        { label: 'Lato',             value: 'Lato'             },
        { label: 'Arial',            value: 'Arial'            },
        { label: 'Times New Roman',  value: 'Times New Roman'  },
        { label: 'Courier New',      value: 'Courier New'      },
        { label: 'Georgia',          value: 'Georgia'          },
        { label: 'Verdana',          value: 'Verdana'          },
        { label: 'Trebuchet MS',     value: 'Trebuchet MS'     },
        { label: 'Tahoma',           value: 'Tahoma'           },
    ];
    const activeFontFamily = editor.getAttributes('textStyle').fontFamily ?? 'Lato';

    // ?? Color picker ????????????????????????????????????????????????????????
    const PRESET_COLORS = [
        '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#ffffff',
        '#ff0000', '#ff4500', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#9900ff',
        '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9d2e9', '#ead1dc',
        '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#9fc5e8', '#b4a7d6', '#ea9999',
    ];

    // ?? Image upload ????????????????????????????????????????????????????????
    const handleImageFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            editor.chain().focus().setImage({ src: reader.result }).run();
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    // ?? Insert table ????????????????????????????????????????????????????????
    const insertTable = () =>
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();

    return (
        <Box
            sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'action.hover',
                flexShrink: 0,
            }}
        >
            {/* ?? Single scrollable toolbar row ?? */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1,
                    py: 0.5,
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    flexWrap: 'nowrap',
                    // hide scrollbar cross-browser but keep scrollability
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                }}
            >
                {/* Heading / Paragraph select */}
                <Select
                    size="small"
                    value={headingValue}
                    onChange={handleHeadingChange}
                    variant="outlined"
                    renderValue={(v) => ({ p: 'P', h1: 'H1', h2: 'H2', h3: 'H3' }[v])}
                    sx={{
                        fontSize: '0.78rem',
                        height: 28,
                        minWidth: 52,
                        flexShrink: 0,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                        '& .MuiSelect-select': { pr: '20px !important' },
                    }}
                >
                    <MenuItem value="p" sx={{ fontSize: '0.85rem' }}>{t('contractTemplate_toolbar_paragraph')}</MenuItem>
                    <MenuItem value="h1" sx={{ fontSize: '1.4rem', fontWeight: 700 }}>{t('contractTemplate_toolbar_h1')}</MenuItem>
                    <MenuItem value="h2" sx={{ fontSize: '1.15rem', fontWeight: 700 }}>{t('contractTemplate_toolbar_h2')}</MenuItem>
                    <MenuItem value="h3" sx={{ fontSize: '1rem', fontWeight: 700 }}>{t('contractTemplate_toolbar_h3')}</MenuItem>
                </Select>

                {/* Font family select */}
                <Select
                    size="small"
                    value={FONT_FAMILIES.some(f => f.value === activeFontFamily) ? activeFontFamily : 'Lato'}
                    onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
                    variant="outlined"
                    renderValue={(v) => {
                        const f = FONT_FAMILIES.find(x => x.value === v);
                        return <span style={{ fontFamily: v, fontSize: '0.78rem' }}>{f?.label ?? v}</span>;
                    }}
                    sx={{
                        fontSize: '0.78rem',
                        height: 28,
                        minWidth: 100,
                        flexShrink: 0,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                        '& .MuiSelect-select': { pr: '20px !important' },
                    }}
                >
                    {FONT_FAMILIES.map(f => (
                        <MenuItem key={f.value} value={f.value} sx={{ fontFamily: f.value, fontSize: '0.9rem' }}>
                            {f.label}
                        </MenuItem>
                    ))}
                </Select>

                {/* Font size select */}
                <Select
                    size="small"
                    value={FONT_SIZES.includes(activeFontSize) ? activeFontSize : '14px'}
                    onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
                    variant="outlined"
                    sx={{
                        fontSize: '0.78rem',
                        height: 28,
                        minWidth: 64,
                        flexShrink: 0,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                        '& .MuiSelect-select': { pr: '20px !important' },
                    }}
                >
                    {FONT_SIZES.map(s => (
                        <MenuItem key={s} value={s} sx={{ fontSize: '0.85rem' }}>{s}</MenuItem>
                    ))}
                </Select>

                <ToolbarDivider />

                {/* Bold · Italic · Underline · Strike */}
                <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                    <Tooltip title={t('contractTemplate_toolbar_bold')}>
                        <IconButton size="small" onClick={() => editor.chain().focus().toggleBold().run()} sx={useBtnSx(editor.isActive('bold'))}>
                            <FormatBoldIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('contractTemplate_toolbar_italic')}>
                        <IconButton size="small" onClick={() => editor.chain().focus().toggleItalic().run()} sx={useBtnSx(editor.isActive('italic'))}>
                            <FormatItalicIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('contractTemplate_toolbar_underline')}>
                        <IconButton size="small" onClick={() => editor.chain().focus().toggleUnderline().run()} sx={useBtnSx(editor.isActive('underline'))}>
                            <FormatUnderlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('contractTemplate_toolbar_strike')}>
                        <IconButton size="small" onClick={() => editor.chain().focus().toggleStrike().run()} sx={useBtnSx(editor.isActive('strike'))}>
                            <StrikethroughSIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>

                <ToolbarDivider />

                {/* Text color */}
                <Box sx={{ flexShrink: 0 }}>
                    <Tooltip title={t('contractTemplate_toolbar_color')}>
                        <IconButton
                            size="small"
                            onClick={(e) => setColorAnchor(e.currentTarget)}
                            sx={useBtnSx(!!editor.getAttributes('textStyle').color)}
                        >
                            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <FormatColorTextIcon fontSize="small" />
                                <Box sx={{
                                    position: 'absolute',
                                    bottom: -2, left: 2, right: 2,
                                    height: 3,
                                    borderRadius: 1,
                                    bgcolor: editor.getAttributes('textStyle').color || 'text.primary',
                                }} />
                            </Box>
                        </IconButton>
                    </Tooltip>
                    <Popover
                        open={Boolean(colorAnchor)}
                        anchorEl={colorAnchor}
                        onClose={() => setColorAnchor(null)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    >
                        <Box sx={{ p: 1.5, width: 220 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                                {t('contractTemplate_toolbar_color')}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                {PRESET_COLORS.map(c => (
                                    <Box
                                        key={c}
                                        onClick={() => { editor.chain().focus().setColor(c).run(); setColorAnchor(null); }}
                                        sx={{
                                            width: 20, height: 20,
                                            bgcolor: c,
                                            borderRadius: 0.5,
                                            cursor: 'pointer',
                                            border: '1px solid rgba(0,0,0,0.15)',
                                            '&:hover': { transform: 'scale(1.2)', zIndex: 1 },
                                            transition: 'transform 0.1s',
                                        }}
                                    />
                                ))}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <input
                                    type="color"
                                    defaultValue={editor.getAttributes('textStyle').color || '#000000'}
                                    onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                                    style={{ width: 32, height: 28, padding: 0, border: 'none', cursor: 'pointer' }}
                                />
                                <Tooltip title={t('contractTemplate_toolbar_color_reset')}>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => { editor.chain().focus().unsetColor().run(); setColorAnchor(null); }}
                                        sx={{ fontSize: '0.7rem', py: 0.25 }}
                                    >
                                        {t('contractTemplate_toolbar_color_reset')}
                                    </Button>
                                </Tooltip>
                            </Box>
                        </Box>
                    </Popover>
                </Box>

                <ToolbarDivider />

                {/* Alignment */}
                <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                    <Tooltip title={t('contractTemplate_toolbar_alignLeft')}>
                        <IconButton size="small" onClick={() => editor.chain().focus().setTextAlign('left').run()} sx={useBtnSx(editor.isActive({ textAlign: 'left' }))}>
                            <FormatAlignLeftIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('contractTemplate_toolbar_alignCenter')}>
                        <IconButton size="small" onClick={() => editor.chain().focus().setTextAlign('center').run()} sx={useBtnSx(editor.isActive({ textAlign: 'center' }))}>
                            <FormatAlignCenterIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('contractTemplate_toolbar_alignRight')}>
                        <IconButton size="small" onClick={() => editor.chain().focus().setTextAlign('right').run()} sx={useBtnSx(editor.isActive({ textAlign: 'right' }))}>
                            <FormatAlignRightIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('contractTemplate_toolbar_alignJustify')}>
                        <IconButton size="small" onClick={() => editor.chain().focus().setTextAlign('justify').run()} sx={useBtnSx(editor.isActive({ textAlign: 'justify' }))}>
                            <FormatAlignJustifyIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>

                <ToolbarDivider />

                {/* Lists · Code */}
                <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                    <Tooltip title={t('contractTemplate_toolbar_bulletList')}>
                        <IconButton size="small" onClick={() => editor.chain().focus().toggleBulletList().run()} sx={useBtnSx(editor.isActive('bulletList'))}>
                            <FormatListBulletedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('contractTemplate_toolbar_orderedList')}>
                        <IconButton size="small" onClick={() => editor.chain().focus().toggleOrderedList().run()} sx={useBtnSx(editor.isActive('orderedList'))}>
                            <FormatListNumberedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('contractTemplate_toolbar_code')}>
                        <IconButton size="small" onClick={() => editor.chain().focus().toggleCode().run()} sx={useBtnSx(editor.isActive('code'))}>
                            <CodeIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>

                <ToolbarDivider />

                {/* Image · Table */}
                <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                    <Tooltip title={t('contractTemplate_toolbar_image')}>
                        <IconButton size="small" onClick={() => imageInputRef.current?.click()} sx={useBtnSx(false)}>
                            <ImageIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={handleImageFile} />
                    <Tooltip title={t('contractTemplate_toolbar_table')}>
                        <IconButton size="small" onClick={insertTable} sx={useBtnSx(editor.isActive('table'))}>
                            <TableChartIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* ?? Table context sub-bar (slides in when cursor is inside a table) ?? */}
            <Collapse in={editor.isActive('table')}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 1,
                        py: 0.4,
                        overflowX: 'auto',
                        flexWrap: 'nowrap',
                        scrollbarWidth: 'none',
                        '&::-webkit-scrollbar': { display: 'none' },
                        borderTop: '1px dashed',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                    }}
                >
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, fontSize: '0.68rem', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {t('contractTemplate_toolbar_tableContext')}
                    </Typography>
                    <ToolbarDivider />

                    {/* Rows */}
                    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                        <Tooltip title={t('contractTemplate_toolbar_addRowBefore')}>
                            <IconButton size="small" onClick={() => editor.chain().focus().addRowBefore().run()} sx={useBtnSx(false)}>
                                <PlaylistAddIcon fontSize="small" sx={{ transform: 'rotate(180deg)' }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('contractTemplate_toolbar_addRowAfter')}>
                            <IconButton size="small" onClick={() => editor.chain().focus().addRowAfter().run()} sx={useBtnSx(false)}>
                                <PlaylistAddIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('contractTemplate_toolbar_deleteRow')}>
                            <IconButton size="small" onClick={() => editor.chain().focus().deleteRow().run()} sx={{ ...useBtnSx(false), color: 'error.main', borderColor: 'error.light', '&:hover': { bgcolor: 'error.light', color: 'error.contrastText' } }}>
                                <PlaylistRemoveIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <ToolbarDivider />

                    {/* Columns */}
                    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                        <Tooltip title={t('contractTemplate_toolbar_addColBefore')}>
                            <IconButton size="small" onClick={() => editor.chain().focus().addColumnBefore().run()} sx={useBtnSx(false)}>
                                <ViewWeekIcon fontSize="small" sx={{ transform: 'scaleX(-1)' }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('contractTemplate_toolbar_addColAfter')}>
                            <IconButton size="small" onClick={() => editor.chain().focus().addColumnAfter().run()} sx={useBtnSx(false)}>
                                <ViewWeekIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('contractTemplate_toolbar_deleteCol')}>
                            <IconButton size="small" onClick={() => editor.chain().focus().deleteColumn().run()} sx={{ ...useBtnSx(false), color: 'error.main', borderColor: 'error.light', '&:hover': { bgcolor: 'error.light', color: 'error.contrastText' } }}>
                                <ViewColumnIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <ToolbarDivider />

                    {/* Header · Merge · Split */}
                    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                        <Tooltip title={t('contractTemplate_toolbar_toggleHeader')}>
                            <IconButton size="small" onClick={() => editor.chain().focus().toggleHeaderRow().run()} sx={useBtnSx(false)}>
                                <TableRowsIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('contractTemplate_toolbar_mergeCells')}>
                            <IconButton size="small" onClick={() => editor.chain().focus().mergeCells().run()} sx={useBtnSx(false)}>
                                <BorderAllIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('contractTemplate_toolbar_splitCell')}>
                            <IconButton size="small" onClick={() => editor.chain().focus().splitCell().run()} sx={useBtnSx(false)}>
                                <BorderClearIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <ToolbarDivider />

                    {/* Toggle borders */}
                    <Tooltip title={editor.getAttributes('table').borderless ? t('contractTemplate_toolbar_showBorders') : t('contractTemplate_toolbar_hideBorders')}>
                        <IconButton
                            size="small"
                            onClick={() => editor.chain().focus().toggleTableBorders().run()}
                            sx={useBtnSx(editor.getAttributes('table').borderless)}
                        >
                            <BorderStyleIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <ToolbarDivider />

                    {/* Delete table */}
                    <Tooltip title={t('contractTemplate_toolbar_deleteTable')}>
                        <IconButton size="small" onClick={() => editor.chain().focus().deleteTable().run()} sx={{ ...useBtnSx(false), flexShrink: 0, color: 'error.main', borderColor: 'error.light', '&:hover': { bgcolor: 'error.main', color: 'white' } }}>
                            <DeleteForeverIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Collapse>

            {/* Image context sub-bar (slides in when an image is selected) */}
            <Collapse in={editor.isActive('image')}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 1,
                        py: 0.4,
                        overflowX: 'auto',
                        flexWrap: 'nowrap',
                        scrollbarWidth: 'none',
                        '&::-webkit-scrollbar': { display: 'none' },
                        borderTop: '1px dashed',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                    }}
                >
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, fontSize: '0.68rem', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {t('contractTemplate_toolbar_imageContext')}
                    </Typography>
                    <ToolbarDivider />
                    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                        <Tooltip title={t('contractTemplate_toolbar_alignLeft')}>
                            <IconButton size="small" onClick={() => editor.chain().focus().setImageAlign('left').run()} sx={useBtnSx(!editor.getAttributes('image').textAlign || editor.getAttributes('image').textAlign === 'left')}>
                                <FormatAlignLeftIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('contractTemplate_toolbar_alignCenter')}>
                            <IconButton size="small" onClick={() => editor.chain().focus().setImageAlign('center').run()} sx={useBtnSx(editor.getAttributes('image').textAlign === 'center')}>
                                <FormatAlignCenterIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('contractTemplate_toolbar_alignRight')}>
                            <IconButton size="small" onClick={() => editor.chain().focus().setImageAlign('right').run()} sx={useBtnSx(editor.getAttributes('image').textAlign === 'right')}>
                                <FormatAlignRightIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Collapse>
        </Box>
    );
};

// ---------------------------------------------------------------------------
// Main form modal
// ---------------------------------------------------------------------------
const ContractTemplateFormModal = ({ open, handleClose, data, isEditing, setData }) => {
    const { t } = useTranslation();
    const service = DataAPIContractTemplatesService();
    const { companySelected } = useContext(AppContext);
    const theme = useTheme();
    const nameRef = useRef(null);

    const [formData, setFormData] = useState({
        idTemplate: 0,
        name: '',
        description: '',
        content: '',
        idCompany: companySelected?.idCompany ?? null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [validationErrors, setValidationErrors] = useState({ name: false });
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
    const [, forceUpdate] = useState(0);

    const editor = useEditor({
        extensions: [
            StarterKit,
            TemplateVariable,
            Placeholder.configure({
                placeholder: t('contractTemplate_placeholder'),
            }),
            TextStyle.configure({ types: ['textStyle'] }),
            Color,
            FontFamily,
            FontSize,
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Table.configure({ resizable: true }),
            TableRow,
            BorderlessTableHeader,
            BorderlessTableCell,
            AlignableImage.configure({
                inline: false,
                allowBase64: true,
                resize: {
                    enabled: true,
                    directions: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
                    minWidth: 40,
                    minHeight: 40,
                    alwaysPreserveAspectRatio: false,
                },
            }),
        ],
        content: '',
        onSelectionUpdate: () => forceUpdate(n => n + 1),
        onTransaction: () => forceUpdate(n => n + 1),
    });

    // 1. Populate form fields when the dialog opens or the record changes.
    //    Never touches the editor here to avoid triggering onUpdate mid-state-set.
    useEffect(() => {
        if (!open) return;
        if (isEditing && data) {
            setFormData({
                idTemplate: data.idTemplate ?? 0,
                name: data.name ?? '',
                description: data.description ?? '',
                content: data.content ?? '',
                idCompany: data.idCompany ?? companySelected?.idCompany ?? null,
            });
        } else {
            setFormData({
                idTemplate: 0,
                name: '',
                description: '',
                content: '',
                idCompany: companySelected?.idCompany ?? null,
            });
        }
        setValidationErrors({ name: false });
        setHasAttemptedSubmit(false);
        setIsFocused(false);
        setTimeout(() => nameRef.current?.focus(), 120);
    }, [open, isEditing, data]);

    // 2. Load editor content separately, after formData is already committed.
    //    Runs only when the dialog opens or the editing target changes.
    useEffect(() => {
        if (!open || !editor) return;
        const contentToLoad = (isEditing && data) ? (data.content ?? '') : '';
        // Use queueMicrotask so this always runs after the React state batch
        // that setFormData belongs to has been flushed.
        queueMicrotask(() => {
            editor.commands.setContent(contentToLoad, false);
        });
    }, [open, isEditing, data, editor]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (hasAttemptedSubmit)
            setValidationErrors(prev => ({ ...prev, [name]: !value.trim() }));
    };

    const insertVariable = useCallback(
        (key) => { editor?.chain().focus().insertVariable(key).run(); },
        [editor]
    );

    const validateForm = () => {
        const errors = { name: !formData.name?.trim() };
        setValidationErrors(errors);
        return !Object.values(errors).some(Boolean);
    };

    const handleSubmit = async () => {
        setHasAttemptedSubmit(true);
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            const payload = { ...formData, content: editor?.getHTML() ?? '' };
            const result = isEditing
                ? await service.editData(payload)
                : await service.addData(payload);

            if (result.success) {
                ShowMessage(
                    isEditing ? t('recordEditedSuccessSingular') : t('recordAddedSuccessSingular'),
                    'success'
                );

                // Build the list item from local formData (already camelCase).
                // Only idTemplate is taken from the server response because EF
                // sets it after INSERT; all other fields come from what we sent.
                const savedItem = {
                    ...formData,
                    content: editor?.getHTML() ?? '',
                    idTemplate: result.data?.idTemplate ?? result.data?.IdTemplate ?? formData.idTemplate,
                    isActive: result.data?.isActive ?? result.data?.IsActive ?? true,
                };

                setData(prev =>
                    isEditing
                        ? prev.map(item =>
                            item.idTemplate === savedItem.idTemplate ? savedItem : item
                          )
                        : [savedItem, ...prev]
                );
                handleClose();
            } else if (result.conflict) {
                ShowMessage(t('dataAlreadyExists'), 'warning');
            } else {
                ShowMessage(t('error'), 'error');
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error('Error saving contract template:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // MUI TextField-matching border colors
    const borderFocused = theme.palette.primary.main;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullScreen
            PaperProps={{ sx: { display: 'flex', flexDirection: 'column' } }}
        >
            {/* ?? Title bar ?? */}
            <DialogTitle sx={{ pb: 1, flexShrink: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'white', borderRadius: 2 }}>
                        {isEditing ? <EditIcon /> : <AddIcon />}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {isEditing ? t('contractTemplate_edit') : t('contractTemplate_add')}
                        </Typography>
                    </Box>
                    <Tooltip title={t('close')}>
                        <IconButton onClick={handleClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </DialogTitle>

            <Divider sx={{ flexShrink: 0 }} />

            {/* ?? Two-column body ?? */}
            <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* Left sidebar: Name, Description, Variables */}
                <Box
                    component={Paper}
                    elevation={0}
                    sx={{
                        width: 280,
                        flexShrink: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        p: 2.5,
                        overflowY: 'auto',
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 0,
                    }}
                >
                    <TextField
                        inputRef={nameRef}
                        label={t('name')}
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        fullWidth
                        size="small"
                        required
                        error={validationErrors.name}
                        helperText={validationErrors.name ? t('field_required') : ''}
                    />

                    <TextField
                        label={t('description')}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        fullWidth
                        size="small"
                        multiline
                        rows={3}
                    />

                    <Box>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mb: 0.75, display: 'block', fontWeight: 600 }}
                        >
                            {t('contractTemplate_variables')}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                            {AVAILABLE_VARIABLES.map((v) => (
                                <Tooltip key={v.key} title={v.key} placement="right">
                                    <Chip
                                        label={v.label}
                                        size="small"
                                        onClick={() => insertVariable(v.key)}
                                        clickable
                                        variant="outlined"
                                        color="primary"
                                        icon={<AddIcon style={{ fontSize: 14 }} />}
                                        sx={{ fontWeight: 500 }}
                                    />
                                </Tooltip>
                            ))}
                        </Box>
                    </Box>
                </Box>

                {/* Right: Rich-text editor fills remaining space */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        position: 'relative',
                    }}
                >
                    {/* Toolbar pinned at top */}
                    <EditorToolbar editor={editor} t={t} />

                    {/* Scrollable editor area */}
                    <Box
                        onClick={() => editor?.commands.focus()}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        sx={{
                            flex: 1,
                            overflowY: 'auto',
                            px: 3,
                            py: 2,
                            cursor: 'text',
                            outline: isFocused ? `2px solid ${borderFocused}` : 'none',
                            outlineOffset: '-2px',
                            transition: 'outline 0.2s',
                            '& .tiptap': {
                                outline: 'none',
                                minHeight: '100%',
                                fontSize: '0.95rem',
                                lineHeight: 1.75,
                                color: 'text.primary',
                                maxWidth: 900,
                                mx: 'auto',
                            },
                            '& .tiptap p': { margin: '0 0 6px' },
                            '& .tiptap h1': { fontSize: '1.8em', fontWeight: 700, margin: '0.5em 0 0.3em' },
                            '& .tiptap h2': { fontSize: '1.4em', fontWeight: 700, margin: '0.5em 0 0.3em' },
                            '& .tiptap h3': { fontSize: '1.15em', fontWeight: 700, margin: '0.5em 0 0.3em' },
                            '& .tiptap ul, & .tiptap ol': { paddingLeft: '1.4em', margin: '4px 0' },
                            '& .tiptap code': {
                                borderRadius: '3px',
                                px: 0.5,
                                fontSize: '0.85em',
                                fontFamily: 'monospace',
                                bgcolor: 'action.hover',
                            },
                            '& .tiptap img': {
                                maxWidth: '100%',
                                height: 'auto',
                                borderRadius: '4px',
                                display: 'block !important',
                                margin: '4px 0',
                            },
                            '& .tiptap img[data-align="center"]': { margin: '4px auto !important' },
                            '& .tiptap img[data-align="right"]': { margin: '4px 0 4px auto !important' },
                            '& .tiptap img[data-align="left"]': { margin: '4px auto 4px 0 !important' },
                            '& .tiptap table': {
                                borderCollapse: 'collapse',
                                width: '100%',
                                margin: '8px 0',
                                tableLayout: 'fixed',
                            },
                            '& .tiptap th, & .tiptap td': {
                                border: '1px solid',
                                borderColor: 'divider',
                                padding: '6px 10px',
                                verticalAlign: 'top',
                                minWidth: 60,
                                position: 'relative',
                            },
                            '& .tiptap th': {
                                bgcolor: 'action.hover',
                                fontWeight: 700,
                                textAlign: 'left',
                            },
                            '& .tiptap .selectedCell': {
                                bgcolor: 'primary.light',
                                opacity: 0.3,
                            },

                        }}
                    >
                        <EditorContent editor={editor} />
                    </Box>
                </Box>
            </Box>

            <Divider sx={{ flexShrink: 0 }} />

            {/* ?? Actions ?? */}
            <DialogActions sx={{ px: 3, py: 1.5, gap: 1, flexShrink: 0 }}>
                <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<CancelIcon />}
                    onClick={handleClose}
                    disabled={isLoading}
                >
                    {t('cancel')}
                </Button>
                <Button
                    variant="contained"
                    disableElevation
                    startIcon={
                        isLoading
                            ? <CircularProgress size={16} color="inherit" />
                            : <SaveIcon />
                    }
                    onClick={handleSubmit}
                    disabled={isLoading}
                >
                    {t('save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ContractTemplateFormModal;
