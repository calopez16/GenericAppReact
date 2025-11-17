using System.Linq.Expressions;

namespace GenericApp.BLL.Sevices.Interface
{
    /// <summary>
    /// Define la interfaz genérica para las operaciones del repositorio (CRUD y consultas).
    /// </summary>
    public interface IRepository : IDisposable
    {
        /// <summary>
        /// Comprueba asíncronamente si existe alguna entidad que cumpla con el filtro especificado.
        /// </summary>
        /// <typeparam name="T">Tipo de entidad.</typeparam>
        /// <param name="filter">Expresión de filtro (opcional).</param>
        /// <param name="includes">Expresiones para incluir propiedades de navegación (opcional).</param>
        /// <returns>Tarea que representa la operación asíncrona. El resultado es True si existe al menos una entidad, false en caso contrario.</returns>
        Task<bool> Any<T>(Expression<Func<T, bool>> filter = null, params Expression<Func<T, object>>[] includes) where T : class;

        /// <summary>
        /// Agrega asíncronamente una entidad a la base de datos y guarda los cambios.
        /// </summary>
        /// <typeparam name="T">Tipo de entidad.</typeparam>
        /// <param name="entity">Entidad a agregar.</param>
        /// <returns>Tarea que representa la operación asíncrona. El resultado es True si se guardó exitosamente, false en caso contrario.</returns>
        Task<bool> Add<T>(T entity) where T : class;

        /// <summary>
        /// Agrega asíncronamente un rango de entidades a la base de datos y guarda los cambios.
        /// </summary>
        /// <typeparam name="T">Tipo de entidad.</typeparam>
        /// <param name="entities">Colección de entidades a agregar.</param>
        /// <returns>Tarea que representa la operación asíncrona. El resultado es True si se guardó exitosamente, false en caso contrario.</returns>
        Task<bool> AddRange<T>(IEnumerable<T> entities) where T : class;

        /// <summary>
        /// Busca asíncronamente entidades que cumplan con un filtro, aplica ordenación e incluye propiedades de navegación.
        /// </summary>
        /// <typeparam name="T">Tipo de entidad.</typeparam>
        /// <param name="filter">Expresión de filtro (opcional).</param>
        /// <param name="orderby">Función de ordenación (opcional).</param>
        /// <param name="includes">Expresiones para incluir propiedades de navegación (opcional).</param>
        /// <returns>Tarea que representa la operación asíncrona. El resultado es una colección de entidades que cumplen los criterios.</returns>
        Task<IEnumerable<T>> FindBy<T>(
            Expression<Func<T, bool>> filter = null,
            Func<IQueryable<T>, IOrderedQueryable<T>> orderby = null,
            params Expression<Func<T, object>>[] includes
            ) where T : class;

        /// <summary>
        /// Obtiene asíncronamente la primera entidad que cumple un filtro o el valor por defecto si no se encuentra ninguna.
        /// </summary>
        /// <typeparam name="T">Tipo de entidad.</typeparam>
        /// <param name="filter">Expresión de filtro (opcional).</param>
        /// <param name="includes">Expresiones para incluir propiedades de navegación (opcional).</param>
        /// <returns>Tarea que representa la operación asíncrona. El resultado es la primera entidad encontrada o null.</returns>
        Task<T> FirstOrDefault<T>(Expression<Func<T, bool>> filter = null, params Expression<Func<T, object>>[] includes) where T : class;

        /// <summary>
        /// Obtiene asíncronamente todas las entidades de un tipo específico.
        /// </summary>
        /// <typeparam name="T">Tipo de entidad.</typeparam>
        /// <returns>Tarea que representa la operación asíncrona. El resultado es una colección de todas las entidades.</returns>
        Task<IEnumerable<T>> GetAll<T>() where T : class;

        /// <summary>
        /// Ejecuta asíncronamente una consulta IQueryable existente y devuelve los resultados como una lista.
        /// </summary>
        /// <typeparam name="T">Tipo de entidad.</typeparam>
        /// <param name="query">Consulta IQueryable a ejecutar.</param>
        /// <returns>Tarea que representa la operación asíncrona. El resultado es una colección de entidades.</returns>
        Task<IEnumerable<T>> Get<T>(IQueryable<T> query) where T : class;

        /// <summary>
        /// Obtiene asíncronamente una entidad por su clave primaria (solo soporta claves primarias de tipo int).
        /// </summary>
        /// <typeparam name="T">Tipo de entidad.</typeparam>
        /// <param name="id">Valor de la clave primaria.</param>
        /// <returns>Tarea que representa la operación asíncrona. El resultado es la entidad encontrada o null.</returns>
        Task<T> GetById<T>(int id) where T : class;

        /// <summary>
        /// Marca una entidad para eliminación y guarda los cambios asíncronamente.
        /// </summary>
        /// <typeparam name="T">Tipo de entidad.</typeparam>
        /// <param name="entity">Entidad a eliminar.</param>
        /// <returns>Tarea que representa la operación asíncrona. El resultado es True si se guardó exitosamente, false en caso contrario.</returns>
        Task<bool> Remove<T>(T entity) where T : class;

        /// <summary>
        /// Busca y elimina asíncronamente una entidad por su clave primaria (solo soporta claves primarias de tipo int).
        /// </summary>
        /// <typeparam name="T">Tipo de entidad.</typeparam>
        /// <param name="id">Valor de la clave primaria.</param>
        /// <returns>Tarea que representa la operación asíncrona. El resultado es True si se eliminó exitosamente, false si no se encontró o hubo error.</returns>
        Task<bool> RemoveById<T>(int id) where T : class;

        /// <summary>
        /// Elimina asíncronamente un rango de entidades de la base de datos y guarda los cambios.
        /// </summary>
        /// <typeparam name="T">Tipo de entidad.</typeparam>
        /// <param name="entities">Colección de entidades a eliminar.</param>
        /// <returns>Tarea que representa la operación asíncrona. El resultado es True si se guardó exitosamente, false en caso contrario.</returns>
        Task<bool> RemoveRange<T>(IEnumerable<T> entities) where T : class;

        /// <summary>
        /// Marca una entidad como modificada y guarda los cambios asíncronamente.
        /// </summary>
        /// <typeparam name="T">Tipo de entidad.</typeparam>
        /// <param name="entity">Entidad a actualizar.</param>
        /// <returns>Tarea que representa la operación asíncrona. El resultado es True si se guardó exitosamente, false en caso contrario.</returns>
        Task<bool> Update<T>(T entity) where T : class;

        /// <summary>
        /// Devuelve asíncronamente un IQueryable para construir consultas complejas.
        /// </summary>
        /// <typeparam name="T">Tipo de entidad.</typeparam>
        /// <returns>Tarea que representa la operación asíncrona. El resultado es un IQueryable sin seguimiento.</returns>
        Task<IQueryable<T>> Query<T>() where T : class;

        /// <summary>
        /// Devuelve asíncronamente un IQueryable con propiedades de navegación incluidas.
        /// </summary>
        /// <typeparam name="T">Tipo de entidad.</typeparam>
        /// <param name="includes">Expresiones para incluir propiedades de navegación.</param>
        /// <returns>Tarea que representa la operación asíncrona. El resultado es un IQueryable con propiedades de navegación cargadas.</returns>
        Task<IQueryable<T>> Query<T>(params Expression<Func<T, object>>[] includes) where T : class;
    }
}