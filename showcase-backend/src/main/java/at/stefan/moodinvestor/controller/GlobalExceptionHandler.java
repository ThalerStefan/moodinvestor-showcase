package at.stefan.moodinvestor.controller;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;


@ControllerAdvice
public class GlobalExceptionHandler {

    static class ErrorBody {
        public int status;
        public String error;
        public String message;
        public String path;
        public String timestamp;

        ErrorBody(HttpStatus status, String message, String path) {
            this.status = status.value();
            this.error = status.getReasonPhrase();
            this.message = message;
            this.path = path;
            this.timestamp = LocalDateTime.now().toString();

        }

    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorBody> handleRse(ResponseStatusException ex,
            org.springframework.web.context.request.WebRequest req) {
                throw new UnsupportedOperationException("Implementation hidden for IP protection.");
            }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorBody> handleValidation(MethodArgumentNotValidException ex,
            org.springframework.web.context.request.WebRequest req) {
                throw new UnsupportedOperationException("Implementation hidden for IP protection.");
            }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorBody> handleOther(Exception ex, org.springframework.web.context.request.WebRequest req) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }
}
