using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _service;

    public TransactionsController(ITransactionService service)
    {
        _service = service;
    }

    [HttpGet]
    public ActionResult<IEnumerable<Transaction>> Get()
    {
        return Ok(_service.GetAll());
    }

    [HttpPost]
    public ActionResult<Transaction> Post([FromBody] NewTransactionRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var created = _service.Add(request);
        return CreatedAtAction(nameof(Get), created);
    }
}
