using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class NewTransactionRequest
{
    [Required]
    public string TransactionDate { get; set; } = "";

    [Required]
    public string AccountNumber { get; set; } = "";

    [Required]
    public string AccountHolderName { get; set; } = "";

    [Range(typeof(decimal), "0", "79228162514264337593543950335", ErrorMessage = "Amount must be zero or greater.")]
    public decimal Amount { get; set; }
}
