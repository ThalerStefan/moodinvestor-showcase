package at.stefan.moodinvestor.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class PfgServiceTest {

    @Test
    void computeScore_min_max_mid() {
        // Formula per code: (Q1..Q5) * 20 / 5, rounded & clamped 0..100
        PfgService s = new PfgService(null); // Repo is not needed here

        byte min = s.computeScore(new Byte[] { 1, 1, 1, 1, 1 });
        byte max = s.computeScore(new Byte[] { 5, 5, 5, 5, 5 });
        byte mid = s.computeScore(new Byte[] { 3, 4, 4, 2, 5 }); // 18/5=3.6 => 72

        assertEquals(20, min);
        assertEquals(100, max);
        assertEquals(72, mid);
    }
}
