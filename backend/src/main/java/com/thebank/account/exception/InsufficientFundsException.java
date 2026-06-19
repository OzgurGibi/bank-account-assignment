package com.thebank.account.exception;

import com.thebank.account.model.enums.Currency;

public class InsufficientFundsException extends RuntimeException {
	public InsufficientFundsException(Currency currency) {
		super("Insufficient funds in the account for currency: " + currency);
	}
}
