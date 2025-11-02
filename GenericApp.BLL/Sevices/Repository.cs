using GenericApp.BLL.Sevices.Interface;
using GenericApp.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace GenericApp.BLL.Sevices
{
    public class Repository : IRepository, IDisposable
    {
        protected readonly ApplicationDBContext _context;
        public Repository(ApplicationDBContext context)
        {
            _context = context;
        }
        public void Dispose()
        {
            if (_context != null)
                _context.Dispose();
        }

        // Modificado: Devuelve Task<bool>
        public async Task<bool> Add<T>(T entity) where T : class
        {
            try
            {
                await _context.Set<T>().AddAsync(entity);
                // Si SaveChangesAsync es exitoso, devuelve true (o el número de filas afectadas > 0)
                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                // TODO: Registrar la excepción (log the exception)
                // Console.WriteLine(ex.Message); 
                return false; // Error al agregar/guardar
            }
        }

        public async Task<bool> Any<T>(Expression<Func<T, bool>> filter = null, params Expression<Func<T, object>>[] includes) where T : class
        {
            try
            {
                IQueryable<T> query = _context.Set<T>();
                if (filter != null)
                {
                    query = query.Where(filter);
                }

                if (includes != null)
                {
                    query = includes.Aggregate(query,
                                     (current, include) => current.Include(include));
                }

                return await query.AnyAsync();
            }
            catch (Exception ex)
            {
                // TODO: Registrar la excepción (log the exception)
                // Console.WriteLine(ex.Message);
                return default; // default para bool es false
            }
        }

        public async Task<IEnumerable<T>> FindBy<T>(Expression<Func<T, bool>> filter = null, Func<IQueryable<T>, IOrderedQueryable<T>> orderby = null, params Expression<Func<T, object>>[] includes) where T : class
        {
            try
            {
                IQueryable<T> query = _context.Set<T>();
                if (filter != null)
                {
                    query = query.Where(filter);
                }

                if (includes != null)
                {
                    query = includes.Aggregate(query,
                                     (current, include) => current.Include(include));
                }

                if (orderby != null)
                {
                    return await orderby(query).ToListAsync();
                }
                return await query.ToListAsync();
            }
            catch (Exception ex)
            {
                // TODO: Registrar la excepción (log the exception)
                // Console.WriteLine(ex.Message);
                return default; // default para IEnumerable<T> es null
            }
        }

        public async Task<T> FirstOrDefault<T>(Expression<Func<T, bool>> filter = null, params Expression<Func<T, object>>[] includes) where T : class
        {
            try
            {
                IQueryable<T> query = _context.Set<T>();
                if (filter != null)
                {
                    query = query.Where(filter);
                }

                if (includes != null)
                {
                    query = includes.Aggregate(query,
                                     (current, include) => current.Include(include));
                }
                return await query.FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                // TODO: Registrar la excepción (log the exception)
                // Console.WriteLine(ex.Message);
                return default; // default para T es null (porque T: class)
            }
        }

        public async Task<IEnumerable<T>> Get<T>(IQueryable<T> query) where T : class
        {
            try
            {
                return await query.ToListAsync();
            }
            catch (Exception ex)
            {
                // TODO: Registrar la excepción (log the exception)
                // Console.WriteLine(ex.Message);
                return default;
            }
        }

        public async Task<IEnumerable<T>> GetAll<T>() where T : class
        {
            try
            {
                return await _context.Set<T>().ToListAsync();
            }
            catch (Exception ex)
            {
                // TODO: Registrar la excepción (log the exception)
                // Console.WriteLine(ex.Message);
                return default;
            }
        }

        public async Task<T> GetById<T>(int id) where T : class
        {
            try
            {
                return await _context.Set<T>().FindAsync(id);
            }
            catch (Exception ex)
            {
                // TODO: Registrar la excepción (log the exception)
                // Console.WriteLine(ex.Message);
                return null;
            }
        }

        // Modificado: Devuelve Task<bool>
        public async Task<bool> Remove<T>(T entity) where T : class
        {
            try
            {
                _context.Set<T>().Remove(entity);
                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                // TODO: Registrar la excepción (log the exception)
                // Console.WriteLine(ex.Message);
                return false; // Error al eliminar/guardar
            }
        }

        // Modificado: Devuelve Task<bool>
        public async Task<bool> RemoveById<T>(int id) where T : class
        {
            try
            {
                var entity = await _context.Set<T>().FindAsync(id);
                if (entity != null)
                {
                    _context.Set<T>().Remove(entity);
                    return await _context.SaveChangesAsync() > 0;
                }
                return false; // No se encontró la entidad para eliminar
            }
            catch (Exception ex)
            {
                // TODO: Registrar la excepción (log the exception)
                // Console.WriteLine(ex.Message);
                return false; // Error al eliminar/guardar
            }
        }

        // Modificado: Devuelve Task<bool>
        public async Task<bool> Update<T>(T entity) where T : class
        {
            try
            {
                _context.Entry(entity).State = EntityState.Modified;
                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                // TODO: Registrar la excepción (log the exception)
                // Console.WriteLine(ex.Message);
                return false; // Error al actualizar/guardar
            }
        }

        public async Task<IQueryable<T>> Query<T>() where T : class
        {
            try
            {
                return _context.Set<T>().AsQueryable();
            }
            catch (Exception ex)
            {
                // TODO: Registrar la excepción (log the exception)
                // Console.WriteLine(ex.Message);
                return null;
            }
        }
    }
}