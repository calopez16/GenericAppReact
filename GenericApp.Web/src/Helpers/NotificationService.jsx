// Este es nuestro "mensajero"
const eventEmitter = {
    _events: {},
    // Función para suscribirse a un evento
    on(event, listener) {
        if (!this._events[event]) this._events[event] = [];
        this._events[event].push(listener);
    },
    // Función para desuscribirse de un evento
    off(event, listenerToRemove) {
        if (!this._events[event]) return;
        this._events[event] = this._events[event].filter(
            (listener) => listener !== listenerToRemove
        );
    },
    // Función para emitir (disparar) un evento
    emit(event, data) {
        if (!this._events[event]) return;
        this._events[event].forEach(listener => listener(data));
    }
};

// Esta es la función que importarás en tus componentes.
// ¡Es global y fácil de usar!
export const ShowMessage = (message, severity = 'success') => {
    eventEmitter.emit('show-alert', { message, severity });
};

export const HideMessage = () => {
    eventEmitter.emit('hide-alert');
};

// Exportamos el emisor para que el Provider pueda suscribirse.
export default eventEmitter;