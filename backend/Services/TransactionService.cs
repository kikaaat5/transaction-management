using System.Globalization;
using backend.Models;

namespace backend.Services;

public class TransactionService : ITransactionService
{
    private static readonly string[] Statuses = { "Pending", "Settled", "Failed" };
    private const string Header = "Transaction Date,Account Number,Account Holder Name,Amount,Status";

    private readonly string _csvPath;
    private readonly object _lock = new();

    public TransactionService(IWebHostEnvironment env)
    {
        _csvPath = Path.Combine(env.ContentRootPath, "Data", "transactions.csv");
    }

    public IEnumerable<Transaction> GetAll()
    {
        lock (_lock)
        {
            if (!File.Exists(_csvPath))
            {
                return Array.Empty<Transaction>();
            }

            return File.ReadAllLines(_csvPath)
                .Skip(1)
                .Where(line => !string.IsNullOrWhiteSpace(line))
                .Select(ParseLine)
                .ToList();
        }
    }

    public Transaction Add(NewTransactionRequest request)
    {
        var transaction = new Transaction
        {
            TransactionDate = request.TransactionDate,
            AccountNumber = request.AccountNumber,
            AccountHolderName = request.AccountHolderName,
            Amount = request.Amount,
            Status = Statuses[Random.Shared.Next(Statuses.Length)]
        };

        lock (_lock)
        {
            if (!File.Exists(_csvPath))
            {
                Directory.CreateDirectory(Path.GetDirectoryName(_csvPath)!);
                File.WriteAllText(_csvPath, Header + Environment.NewLine);
            }

            File.AppendAllText(_csvPath, ToLine(transaction) + Environment.NewLine);
        }

        return transaction;
    }

    private static Transaction ParseLine(string line)
    {
        var parts = line.Split(',');

        decimal amount = 0m;
        if (parts.Length > 3)
        {
            decimal.TryParse(parts[3], NumberStyles.Number, CultureInfo.InvariantCulture, out amount);
        }

        return new Transaction
        {
            TransactionDate = parts.Length > 0 ? parts[0] : "",
            AccountNumber = parts.Length > 1 ? parts[1] : "",
            AccountHolderName = parts.Length > 2 ? parts[2] : "",
            Amount = amount,
            Status = parts.Length > 4 ? parts[4] : ""
        };
    }

    private static string ToLine(Transaction t)
    {
        var amount = t.Amount.ToString("F2", CultureInfo.InvariantCulture);
        return string.Join(',', t.TransactionDate, t.AccountNumber, t.AccountHolderName, amount, t.Status);
    }
}
