package at.stefan.moodinvestor.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import at.stefan.moodinvestor.model.PositionKey;
import at.stefan.moodinvestor.model.PositionView;

public interface PositionViewRepository extends JpaRepository<PositionView, PositionKey> {

    // All positions of a user
    List<PositionView> findById_ClerkUserId(String clerkUserId);

    // One position of a user for one symbol
    Optional<PositionView> findById_ClerkUserIdAndId_Symbol(String clerkUserId, String symbol);
}
