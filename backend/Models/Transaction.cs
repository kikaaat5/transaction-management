namespace backend.Models;

public class Transaction
{
    public string TransactionDate { get; set; } = "";
    public string AccountNumber { get; set; } = "";
    public string AccountHolderName { get; set; } = "";
    public decimal Amount { get; set; }
    public string Status { get; set; } = "";
}
