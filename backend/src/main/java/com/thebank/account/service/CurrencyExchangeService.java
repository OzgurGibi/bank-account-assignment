package com.thebank.account.service;

import com.thebank.account.model.enums.Currency;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.EnumMap;
import java.util.Map;

@Service
public class CurrencyExchangeService {
	private static final Map<Currency, BigDecimal> RATES_TO_EUR = new EnumMap<>(Currency.class);

	static {
		RATES_TO_EUR.put(Currency.EUR, new BigDecimal("1.0"));
		RATES_TO_EUR.put(Currency.USD, new BigDecimal("1.14"));
		RATES_TO_EUR.put(Currency.SEK, new BigDecimal("10.98"));
		RATES_TO_EUR.put(Currency.GBP, new BigDecimal("0.86"));
		RATES_TO_EUR.put(Currency.VND, new BigDecimal("30100.0"));
	}

	public BigDecimal convert(BigDecimal amount, Currency from, Currency to) {
		if (from == to) {
			return amount;
		}

		BigDecimal rateFrom = RATES_TO_EUR.get(from);
		BigDecimal rateTo = RATES_TO_EUR.get(to);

		// Convert to EUR first: amountInEur = amount / rateFrom
		BigDecimal amountInEur = amount.divide(rateFrom, 8, RoundingMode.HALF_UP);
		// Convert from EUR to target: targetAmount = amountInEur * rateTo
		BigDecimal converted = amountInEur.multiply(rateTo);

		// Round to 4 decimal places for precision
		return converted.setScale(4, RoundingMode.HALF_UP);
	}

	public boolean isSupported(Currency currency) {
		return RATES_TO_EUR.containsKey(currency);
	}

	public BigDecimal getRate(Currency from, Currency to) {
		if (from == to) return BigDecimal.ONE;
		return RATES_TO_EUR.get(to).divide(RATES_TO_EUR.get(from), 4, RoundingMode.HALF_UP);
	}
}
