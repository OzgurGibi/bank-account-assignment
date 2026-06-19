package com.thebank.account;

import com.thebank.account.exception.InsufficientFundsException;
import com.thebank.account.exception.SameCurrencyException;
import com.thebank.account.exception.UnsupportedCurrencyException;
import com.thebank.account.model.entity.Account;
import com.thebank.account.model.enums.Currency;
import com.thebank.account.service.AccountService;
import com.thebank.account.service.CurrencyExchangeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class BankAccountApplicationTests {

	@Autowired
	private AccountService accountService;

	@Autowired
	private CurrencyExchangeService currencyExchangeService;

	@Test
	void contextLoads() {
	}

	@Test
	void testCreateAccount() {
		Account account = accountService.createAccount("Savings EUR", Currency.EUR, "Özgür");
		assertNotNull(account.getId());
		assertEquals("Savings EUR", account.getName());
		assertEquals(Currency.EUR, account.getCurrency());
		assertEquals(BigDecimal.ZERO, account.getBalance());
		assertEquals("Özgür", account.getOwner());
	}

	@Test
	void testDeposit() {
		Account account = accountService.createAccount("Checking USD", Currency.USD, "Özgür");
		Account updated = accountService.deposit(account.getId(), Currency.USD, new BigDecimal("150.00"));
		assertEquals(new BigDecimal("150.00"), updated.getBalance());
	}

	@Test
	void testDepositWrongCurrency() {
		Account account = accountService.createAccount("Checking USD", Currency.USD, "Özgür");
		assertThrows(UnsupportedCurrencyException.class, () -> {
			accountService.deposit(account.getId(), Currency.EUR, new BigDecimal("150.00"));
		});
	}

	@Test
	void testDebitSuccess() {
		Account account = accountService.createAccount("Checking USD", Currency.USD, "Özgür");
		accountService.deposit(account.getId(), Currency.USD, new BigDecimal("200.00"));
		Account updated = accountService.debit(account.getId(), Currency.USD, new BigDecimal("50.00"));
		assertEquals(new BigDecimal("150.00"), updated.getBalance());
	}

	@Test
	void testDebitInsufficientFunds() {
		Account account = accountService.createAccount("Checking USD", Currency.USD, "Özgür");
		accountService.deposit(account.getId(), Currency.USD, new BigDecimal("20.00"));
		assertThrows(InsufficientFundsException.class, () -> {
			accountService.debit(account.getId(), Currency.USD, new BigDecimal("50.00"));
		});
	}

	@Test
	void testExchangeSuccess() {
		Account eurAccount = accountService.createAccount("EUR Account", Currency.EUR, "Özgür");
		Account usdAccount = accountService.createAccount("USD Account", Currency.USD, "Özgür");

		// Deposit 100 EUR
		accountService.deposit(eurAccount.getId(), Currency.EUR, new BigDecimal("100.00"));

		// Exchange 50 EUR to USD
		BigDecimal expectedUsd = currencyExchangeService.convert(new BigDecimal("50.00"), Currency.EUR, Currency.USD);
		AccountService.ExchangeResult result = accountService.exchange(eurAccount.getId(), usdAccount.getId(), new BigDecimal("50.00"));

		assertEquals(new BigDecimal("50.00"), result.getSourceAmount());
		assertEquals(expectedUsd, result.getDestAmount());
		
		Account updatedEur = accountService.getAccount(eurAccount.getId());
		Account updatedUsd = accountService.getAccount(usdAccount.getId());

		assertEquals(new BigDecimal("50.0000"), updatedEur.getBalance().setScale(4, RoundingMode.HALF_UP));
		assertEquals(expectedUsd, updatedUsd.getBalance().setScale(4, RoundingMode.HALF_UP));
	}

	@Test
	void testExchangeSameCurrency() {
		Account eurAccount1 = accountService.createAccount("EUR Account 1", Currency.EUR, "Özgür");
		Account eurAccount2 = accountService.createAccount("EUR Account 2", Currency.EUR, "Özgür");

		assertThrows(SameCurrencyException.class, () -> {
			accountService.exchange(eurAccount1.getId(), eurAccount2.getId(), new BigDecimal("50.00"));
		});
	}
}
