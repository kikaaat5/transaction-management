using backend.Models;

namespace backend.Services;

public interface ITransactionService
{
    IEnumerable<Transaction> GetAll();
    Transaction Add(NewTransactionRequest request);
}
