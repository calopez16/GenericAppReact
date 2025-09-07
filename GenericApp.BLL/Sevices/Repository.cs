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
        public async Task<T> Add<T>(T entity) where T : class
        {
            await _context.Set<T>().AddAsync(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> Any<T>(Expression<Func<T, bool>> filter = null, params Expression<Func<T, object>>[] includes) where T : class
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

        public async Task<IEnumerable<T>> FindBy<T>(Expression<Func<T, bool>> filter = null, Func<IQueryable<T>, IOrderedQueryable<T>> orderby = null, params Expression<Func<T, object>>[] includes) where T : class
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

        public async Task<T> FirstOrDefault<T>(Expression<Func<T, bool>> filter = null, params Expression<Func<T, object>>[] includes) where T : class
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
        public async Task<IEnumerable<T>> Get<T>(IQueryable<T> query) where T : class
        {
            return await query.ToListAsync();
        }
        public async Task<IEnumerable<T>> GetAll<T>() where T : class
        {
            return await _context.Set<T>().ToListAsync();
        }

        public async Task<T> GetById<T>(int id) where T : class
        {
            return await _context.Set<T>().FindAsync(id);
        }

        public async Task Remove<T>(T entity) where T : class
        {
            _context.Set<T>().Remove(entity);
        }

        public async Task RemoveById<T>(int id) where T : class
        {
            var entity = await _context.Set<T>().FindAsync(id);
            _context.Set<T>().Remove(entity);
        }

        public async Task Update<T>(T entity) where T : class
        {
            _context.Entry(entity).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task<IQueryable<T>> Query<T>() where T : class
        {
            return _context.Set<T>().AsQueryable();
        }
    }

}
