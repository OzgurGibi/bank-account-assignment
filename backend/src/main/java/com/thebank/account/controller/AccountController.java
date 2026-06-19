package com.thebank.account.controller;

import com.thebank.account.model.entity.Account;
import com.thebank.account.model.enums.Currency;
import com.thebank.account.service.AccountService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "*")
public class AccountController {
	private final AccountService accountService;

	public AccountController(AccountService accountService) {
		this.accountService = accountService;
	}

	@GetMapping
	public ResponseEntity<List<Account>> getAllAccounts(@RequestParam(value = "owner", defaultValue = "Özgür") String owner) {
		return ResponseEntity.ok(accountService.getAllAccounts(owner));
	}

	@GetMapping("/{id}")
	public ResponseEntity<Account> getAccount(@PathVariable("id") UUID id) {
		return ResponseEntity.ok(accountService.getAccount(id));
	}

	@PostMapping
	public ResponseEntity<Account> createAccount(@RequestBody Map<String, String> request) {
		String name = request.get("name");
		Currency currency = Currency.valueOf(request.get("currency").toUpperCase());
		String owner = request.getOrDefault("owner", "Özgür");
		return new ResponseEntity<>(accountService.createAccount(name, currency, owner), HttpStatus.CREATED);
	}

	@PostMapping("/{id}/deposit")
	public ResponseEntity<Account> deposit(@PathVariable("id") UUID id, @RequestBody Map<String, Object> request) {
		Currency currency = Currency.valueOf(request.get("currency").toString().toUpperCase());
		BigDecimal amount = new BigDecimal(request.get("amount").toString());
		return ResponseEntity.ok(accountService.deposit(id, currency, amount));
	}

	@PostMapping("/{id}/debit")
	public ResponseEntity<Account> debit(@PathVariable("id") UUID id, @RequestBody Map<String, Object> request) {
		Currency currency = Currency.valueOf(request.get("currency").toString().toUpperCase());
		BigDecimal amount = new BigDecimal(request.get("amount").toString());
		return ResponseEntity.ok(accountService.debit(id, currency, amount));
	}

	@PostMapping("/exchange")
	public ResponseEntity<Map<String, Object>> exchange(@RequestBody Map<String, Object> request) {
		UUID sourceAccountId = UUID.fromString(request.get("sourceAccountId").toString());
		UUID destAccountId = UUID.fromString(request.get("destAccountId").toString());
		BigDecimal amount = new BigDecimal(request.get("amount").toString());

		AccountService.ExchangeResult result = accountService.exchange(sourceAccountId, destAccountId, amount);

		return ResponseEntity.ok(Map.of(
				"sourceAccount", result.getSourceAccount(),
				"destAccount", result.getDestAccount(),
				"sourceAmount", result.getSourceAmount(),
				"destAmount", result.getDestAmount(),
				"rate", result.getRate()
		));
	}
}
