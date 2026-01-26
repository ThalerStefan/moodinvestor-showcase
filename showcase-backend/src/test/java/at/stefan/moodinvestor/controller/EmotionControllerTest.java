package at.stefan.moodinvestor.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EmotionControllerTest {

    @Autowired
    MockMvc mvc;

    @Test
    void create_and_get() throws Exception {
        String body = """
                {"day":"2025-10-15","mood":72,"note":"Trainingstag"}
                """;
        mvc.perform(post("/api/emotions").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()) // Controller returns DTO directly (no 201)
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));

        mvc.perform(get("/api/emotions/2025-10-15"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    void get_not_found_404() throws Exception {
        mvc.perform(get("/api/emotions/2025-01-01"))
                .andExpect(status().isNotFound());
    }

    @Test
    void create_bad_day_400() throws Exception {
        String body = """
                {"day":"NOT_A_DATE","mood":50}
                """;
        mvc.perform(post("/api/emotions").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
    }
}
