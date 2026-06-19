package com.thebank.account.service;

import com.thebank.account.exception.*;
import com.thebank.account.model.entity.Account;
import com.thebank.account.model.entity.Transaction;
import com.thebank.account.model.enums.Currency;
import com.thebank.account.model.enums.TransactionType;
import com.thebank.account.repository.AccountRepository;
import com.thebank.account.repository.TransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AccountService {
	private final AccountRepository accountRepository;
	private final TransactionRepository transactionRepository;
	private final CurrencyExchangeService currencyExchangeService;
	private final ExternalLoggerService externalLoggerService;

	public AccountService(
			AccountRepository accountRepository,
			TransactionRepository transactionRepository,
			CurrencyExchangeService currencyExchangeService,
			ExternalLoggerService externalLoggerService
	) {
		this.accountRepository = accountRepository;
		this.transactionRepository = transactionRepository;
		this.currencyExchangeService = currencyExchangeService;
		this.externalLoggerService = externalLoggerService;
	}

	public List<Account> getAllAccounts(String owner) {
		return accountRepository.findByOwner(owner);
	}

	public Account getAccount(UUID accountId) {
		return accountRepository.findById(accountId)
				.orElseThrow(() -> new AccountNotFoundException(accountId));
	}

	@Transactional
	public Account createAccount(String name, Currency currency, String owner) {
		String cardNumber = generateRandomCardNumber();
		Account account = new Account(
				UUID.randomUUID(),
				name,
				currency,
				BigDecimal.ZERO,
				owner,
				cardNumber
		);
		return accountRepository.save(account);
	}

	private String generateRandomCardNumber() {
		java.util.concurrent.ThreadLocalRandom random = java.util.concurrent.ThreadLocalRandom.current();
		StringBuilder sb = new StringBuilder("5");
		for (int i = 0; i < 15; i++) {
			sb.append(random.nextInt(10));
		}
		return sb.toString();
	}

	@Transactional
	public Account deposit(UUID accountId, Currency currency, BigDecimal amount) {
		validateAmount(amount);
		Account account = getAccount(accountId);
		
		if (account.getCurrency() != currency) {
			throw new UnsupportedCurrencyException(currency);
		}

		BigDecimal newBalance = account.getBalance().add(amount);
		account.setBalance(newBalance);
		accountRepository.save(account);

		// Record transaction
		Transaction transaction = new Transaction(
				UUID.randomUUID(),
				accountId,
				TransactionType.DEPOSIT,
				amount,
				currency,
				newBalance,
				"Deposit of " + amount + " " + currency,
				LocalDateTime.now()
		);
		transactionRepository.save(transaction);

		return account;
	}

	@Transactional
	public Account debit(UUID accountId, Currency currency, BigDecimal amount) {
		validateAmount(amount);
		Account account = getAccount(accountId);

		if (account.getCurrency() != currency) {
			throw new UnsupportedCurrencyException(currency);
		}

		if (account.getBalance().compareTo(amount) < 0) {
			throw new InsufficientFundsException(currency);
		}

		// Simulate external logging call before debiting
		externalLoggerService.logDebit(accountId, currency, amount);

		BigDecimal newBalance = account.getBalance().subtract(amount);
		account.setBalance(newBalance);
		accountRepository.save(account);

		// Record transaction
		Transaction transaction = new Transaction(
				UUID.randomUUID(),
				accountId,
				TransactionType.DEBIT,
				amount,
				currency,
				newBalance,
				"Debit of " + amount + " " + currency,
				LocalDateTime.now()
		);
		transactionRepository.save(transaction);

		return account;
	}

	@Transactional
	public ExchangeResult exchange(UUID sourceAccountId, UUID destAccountId, BigDecimal sourceAmount) {
		validateAmount(sourceAmount);
		Account sourceAccount = getAccount(sourceAccountId);
		Account destAccount = getAccount(destAccountId);

		if (sourceAccount.getCurrency() == destAccount.getCurrency()) {
			throw new SameCurrencyException();
		}

		if (sourceAccount.getBalance().compareTo(sourceAmount) < 0) {
			throw new InsufficientFundsException(sourceAccount.getCurrency());
		}

		// Calculate exchange
		BigDecimal destAmount = currencyExchangeService.convert(
				sourceAmount,
				sourceAccount.getCurrency(),
				destAccount.getCurrency()
		);

		// Debit source account
		externalLoggerService.logDebit(sourceAccountId, sourceAccount.getCurrency(), sourceAmount);
		BigDecimal newSourceBalance = sourceAccount.getBalance().subtract(sourceAmount);
		sourceAccount.setBalance(newSourceBalance);
		accountRepository.save(sourceAccount);

		// Record source transaction (EXCHANGE_OUT)
		Transaction sourceTx = new Transaction(
				UUID.randomUUID(),
				sourceAccountId,
				TransactionType.EXCHANGE_OUT,
				sourceAmount,
				sourceAccount.getCurrency(),
				newSourceBalance,
				"Exchanged " + sourceAmount + " " + sourceAccount.getCurrency() + " to " + destAccount.getCurrency() + " (Account: " + destAccount.getName() + ")",
				LocalDateTime.now()
		);
		transactionRepository.save(sourceTx);

		// Deposit destination account
		BigDecimal newDestBalance = destAccount.getBalance().add(destAmount);
		destAccount.setBalance(newDestBalance);
		accountRepository.save(destAccount);

		// Record destination transaction (EXCHANGE_IN)
		Transaction destTx = new Transaction(
				UUID.randomUUID(),
				destAccountId,
				TransactionType.EXCHANGE_IN,
				destAmount,
				destAccount.getCurrency(),
				newDestBalance,
				"Exchanged from " + sourceAccount.getCurrency() + " (Account: " + sourceAccount.getName() + "). Received " + destAmount + " " + destAccount.getCurrency(),
				LocalDateTime.now()
		);
		transactionRepository.save(destTx);

		return new ExchangeResult(
				sourceAccount,
				destAccount,
				sourceAmount,
				destAmount,
				currencyExchangeService.getRate(sourceAccount.getCurrency(), destAccount.getCurrency())
		);
	}

	public Page<Transaction> getTransactionHistory(UUID accountId, Pageable pageable) {
		// Verify account exists
		getAccount(accountId);
		return transactionRepository.findByAccountIdOrderByTimestampDesc(accountId, pageable);
	}

	public List<Transaction> getAllTransactionsSorted(UUID accountId) {
		getAccount(accountId);
		return transactionRepository.findByAccountIdOrderByTimestampAsc(accountId);
	}

	private void validateAmount(BigDecimal amount) {
		if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
			throw new NegativeAmountException();
		}
	}

	public static class ExchangeResult {
		private final Account sourceAccount;
		private final Account destAccount;
		private final BigDecimal sourceAmount;
		private final BigDecimal destAmount;
		private final BigDecimal rate;

		public ExchangeResult(Account sourceAccount, Account destAccount, BigDecimal sourceAmount, BigDecimal destAmount, BigDecimal rate) {
			this.sourceAccount = sourceAccount;
			this.destAccount = destAccount;
			this.sourceAmount = sourceAmount;
			this.destAmount = destAmount;
			this.rate = rate;
		}

		public Account getSourceAccount() { return sourceAccount; }
		public Account getDestAccount() { return destAccount; }
		public BigDecimal getSourceAmount() { return sourceAmount; }
		public BigDecimal getDestAmount() { return destAmount; }
		public BigDecimal getRate() { return rate; }
	}
}
