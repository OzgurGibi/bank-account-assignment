package com.thebank.account.exception;

public class SameCurrencyException extends RuntimeException {
	public SameCurrencyException() {
		super("Source and destination accounts must have different currencies to perform exchange.");
	}
}
