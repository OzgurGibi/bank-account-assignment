package com.thebank.account.controller;

import com.thebank.account.exception.TransactionNotFoundException;
import com.thebank.account.model.entity.Account;
import com.thebank.account.model.entity.Transaction;
import com.thebank.account.repository.TransactionRepository;
import com.thebank.account.service.AccountService;
import com.thebank.account.service.PdfGenerationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "*")
public class TransactionController {
	private final AccountService accountService;
	private final TransactionRepository transactionRepository;
	private final PdfGenerationService pdfGenerationService;

	public TransactionController(
			AccountService accountService,
			TransactionRepository transactionRepository,
			PdfGenerationService pdfGenerationService
	) {
		this.accountService = accountService;
		this.transactionRepository = transactionRepository;
		this.pdfGenerationService = pdfGenerationService;
	}

	@GetMapping("/api/accounts/{accountId}/transactions")
	public ResponseEntity<Page<Transaction>> getTransactions(
			@PathVariable("accountId") UUID accountId,
			@RequestParam(value = "page", defaultValue = "0") int page,
			@RequestParam(value = "size", defaultValue = "10") int size
	) {
		Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
		return ResponseEntity.ok(accountService.getTransactionHistory(accountId, pageable));
	}

	@GetMapping("/api/accounts/{accountId}/transactions/all")
	public ResponseEntity<List<Transaction>> getAllTransactions(@PathVariable("accountId") UUID accountId) {
		return ResponseEntity.ok(accountService.getAllTransactionsSorted(accountId));
	}

	@GetMapping("/api/transactions/{id}")
	public ResponseEntity<Transaction> getTransaction(@PathVariable("id") UUID id) {
		Transaction transaction = transactionRepository.findById(id)
				.orElseThrow(() -> new TransactionNotFoundException(id));
		return ResponseEntity.ok(transaction);
	}

	@GetMapping("/api/transactions/{id}/pdf")
	public ResponseEntity<byte[]> downloadPdf(@PathVariable("id") UUID id) {
		Transaction transaction = transactionRepository.findById(id)
				.orElseThrow(() -> new TransactionNotFoundException(id));
		Account account = accountService.getAccount(transaction.getAccountId());

		byte[] pdfBytes = pdfGenerationService.generateTransactionPdf(transaction, account);

		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"receipt-" + id + ".pdf\"")
				.contentType(MediaType.APPLICATION_PDF)
				.body(pdfBytes);
	}
}
