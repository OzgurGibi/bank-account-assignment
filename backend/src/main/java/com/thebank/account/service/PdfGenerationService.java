package com.thebank.account.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.thebank.account.model.entity.Account;
import com.thebank.account.model.entity.Transaction;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfGenerationService {

	public byte[] generateTransactionPdf(Transaction transaction, Account account) {
		try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			Document document = new Document(PageSize.A5);
			PdfWriter.getInstance(document, out);
			document.open();

			// Add Styling & Fonts
			Font titleFont = new Font(Font.HELVETICA, 16, Font.BOLD, new Color(238, 115, 0)); // Swedbank Orange
			Font headerFont = new Font(Font.HELVETICA, 10, Font.BOLD, Color.DARK_GRAY);
			Font valueFont = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.BLACK);
			Font footerFont = new Font(Font.HELVETICA, 8, Font.ITALIC, Color.GRAY);

			// Title
			Paragraph title = new Paragraph("Swedbank Transaction Receipt", titleFont);
			title.setAlignment(Element.ALIGN_CENTER);
			title.setSpacingAfter(20);
			document.add(title);

			// Info Table
			PdfPTable table = new PdfPTable(2);
			table.setWidthPercentage(100);
			table.setSpacingBefore(10);
			table.setSpacingAfter(20);

			// Helper method to add row
			addTableRow(table, "Transaction ID:", transaction.getId().toString(), headerFont, valueFont);
			addTableRow(table, "Account Name:", account.getName(), headerFont, valueFont);
			addTableRow(table, "Account Currency:", account.getCurrency().toString(), headerFont, valueFont);
			addTableRow(table, "Transaction Type:", transaction.getType().toString(), headerFont, valueFont);
			addTableRow(table, "Amount:", String.format("%,.2f %s", transaction.getAmount(), transaction.getCurrency()), headerFont, valueFont);
			addTableRow(table, "Balance After:", String.format("%,.2f %s", transaction.getBalanceAfter(), account.getCurrency()), headerFont, valueFont);
			addTableRow(table, "Date & Time:", transaction.getTimestamp().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")), headerFont, valueFont);
			addTableRow(table, "Description:", transaction.getDescription(), headerFont, valueFont);

			document.add(table);

			// Footer
			Paragraph footer = new Paragraph("Thank you for banking with Swedbank.\nThis is a computer-generated transaction receipt.", footerFont);
			footer.setAlignment(Element.ALIGN_CENTER);
			document.add(footer);

			document.close();
			return out.toByteArray();
		} catch (Exception e) {
			throw new RuntimeException("Error generating PDF", e);
		}
	}

	private void addTableRow(PdfPTable table, String header, String value, Font headerFont, Font valueFont) {
		PdfPCell cellHeader = new PdfPCell(new Phrase(header, headerFont));
		cellHeader.setBorder(Rectangle.BOTTOM);
		cellHeader.setBorderColor(Color.LIGHT_GRAY);
		cellHeader.setPadding(8);
		cellHeader.setBackgroundColor(new Color(245, 245, 245));

		PdfPCell cellValue = new PdfPCell(new Phrase(value, valueFont));
		cellValue.setBorder(Rectangle.BOTTOM);
		cellValue.setBorderColor(Color.LIGHT_GRAY);
		cellValue.setPadding(8);

		table.addCell(cellHeader);
		table.addCell(cellValue);
	}
}
