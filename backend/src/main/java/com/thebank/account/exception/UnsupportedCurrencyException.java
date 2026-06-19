package com.thebank.account.exception;

import com.thebank.account.model.enums.Currency;

public class UnsupportedCurrencyException extends RuntimeException {
	public UnsupportedCurrencyException(Currency currency) {
		super("Currency is not supported: " + currency);
	}
}
