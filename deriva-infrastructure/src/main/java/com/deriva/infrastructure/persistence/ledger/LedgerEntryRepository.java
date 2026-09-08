package com.deriva.infrastructure.persistence.ledger;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface LedgerEntryRepository extends JpaRepository<LedgerEntryEntity, UUID> {
    // Inherits save() which acts as append if we only call it with new entities.
    // No update or delete methods are exposed.
}
