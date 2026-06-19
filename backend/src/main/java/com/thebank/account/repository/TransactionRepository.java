package com.thebank.account.repository;

import com.thebank.account.model.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
	Page<Transaction> findByAccountIdOrderByTimestampDesc(UUID accountId, Pageable pageable);
	List<Transaction> findByAccountIdOrderByTimestampAsc(UUID accountId);
}
