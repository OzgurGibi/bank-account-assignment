package com.thebank.account.exception;

public class NegativeAmountException extends RuntimeException {
	public NegativeAmountException() {
		super("Amount must be positive and greater than zero.");
	}
}
