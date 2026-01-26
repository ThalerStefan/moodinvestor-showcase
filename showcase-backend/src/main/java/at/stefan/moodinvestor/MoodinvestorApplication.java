package at.stefan.moodinvestor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import at.stefan.moodinvestor.config.PriceServiceProperties;

@SpringBootApplication
@EnableConfigurationProperties(PriceServiceProperties.class)
public class MoodinvestorApplication {

	public static void main(String[] args) {
		try {
			SpringApplication.run(MoodinvestorApplication.class, args);
		} catch (Throwable t) {
			// This is the "emergency exit" for error messages
			System.err.println("!!!!! CRITICAL STARTUP ERROR !!!!!");
			t.printStackTrace();
		}
	}

}