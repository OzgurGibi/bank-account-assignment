package com.thebank.account.service;

import com.thebank.account.model.enums.Currency;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.UUID;

@Service
public class ExternalLoggerService {
	private static final Logger log = LoggerFactory.getLogger(ExternalLoggerService.class);
	private final HttpClient httpClient;

	public ExternalLoggerService() {
		this.httpClient = HttpClient.newBuilder()
				.connectTimeout(Duration.ofSeconds(5))
				.build();
	}

	public void logDebit(UUID accountId, Currency currency, BigDecimal amount) {
		log.info("Simulating external logging for debit. Account: {}, Amount: {} {}", accountId, amount, currency);
		
		try {
			HttpRequest request = HttpRequest.newBuilder()
					.uri(URI.create("https://httpstat.us/200"))
					.timeout(Duration.ofSeconds(5))
					.GET()
					.build();

			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
			
			if (response.statusCode() == 200) {
				log.info("External logging successfully completed. Response status: 200");
			} else {
				log.warn("External logging system returned status code: {}", response.statusCode());
			}
		} catch (Exception e) {
			log.error("Failed to call external logging system: {}", e.getMessage(), e);
			// We do not block the transaction in case the simulation endpoint is down,
			// but we log it as an error.
		}
	}
}
