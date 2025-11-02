using System.Linq.Expressions;

namespace GenericApp.BLL.Sevices.Interface
{
    public interface IRepository : IDisposable
    {
        Task<bool> Any<T>(Expression<Func<T, bool>> filter = null, params Expression<Func<T, object>>[] includes) where T : class;

        // Modificado: Ahora devuelve Task<bool>
        Task<bool> Add<T>(T entity) where T : class;

        Task<IEnumerable<T>> FindBy<T>(
            Expression<Func<T, bool>> filter = null,
            Func<IQueryable<T>, IOrderedQueryable<T>> orderby = null,
            params Expression<Func<T, object>>[] includes
            ) where T : class;
        Task<T> FirstOrDefault<T>(Expression<Func<T, bool>> filter = null, params Expression<Func<T, object>>[] includes) where T : class;
        Task<IEnumerable<T>> GetAll<T>() where T : class;
        Task<IEnumerable<T>> Get<T>(IQueryable<T> query) where T : class;
        Task<T> GetById<T>(int id) where T : class;

        // Modificado: Ahora devuelve Task<bool>
        Task<bool> Remove<T>(T entity) where T : class;

        // Modificado: Ahora devuelve Task<bool>
        Task<bool> RemoveById<T>(int id) where T : class;

        // Modificado: Ahora devuelve Task<bool>
        Task<bool> Update<T>(T entity) where T : class;

        Task<IQueryable<T>> Query<T>() where T : class;
    }
}