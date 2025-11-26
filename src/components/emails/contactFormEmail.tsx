// components/emails/contactForm.tsx
import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ContactFormEmailProps {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  message: string;
}

export const ContactFormEmail = ({
  firstName = "Max",
  lastName = "Mustermann",
  email = "max.mustermann@example.com",
  phone = "+49 (123) 456-7890",
  message = "Dies ist eine Beispielnachricht aus dem Kontaktformular.",
}: ContactFormEmailProps) => {
  const fullName = lastName ? `${firstName} ${lastName}` : firstName;

  return (
    <Html>
      <Head />
      <Preview>Neue Anfrage von {fullName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Img
              src="https://la-volotte.de/images/lavolottelogo.png"
              width="42"
              height="42"
              alt="Apple Logo"
            />
            <Heading style={heading}>Neue Anfrage</Heading>
            <Hr style={hr} />

            <Section style={contactInfo}>
              <Section style={infoSection}>
                <Text style={label}>Kontakt info:</Text>
                <Text style={field}>
                  <strong>Name:</strong> {fullName}
                </Text>
                <Text style={field}>
                  <strong>E-Mail:</strong>{" "}
                  <Link href={`mailto:${email}`} style={link}>
                    {email}
                  </Link>
                </Text>
                {phone && (
                  <Text style={field}>
                    <strong>Telefon:</strong>{" "}
                    <Link href={`tel:${phone}`} style={link}>
                      {phone}
                    </Link>
                  </Text>
                )}
              </Section>

              <Hr style={hr} />

              <Section style={messageSection}>
                <Text style={label}>Nachricht:</Text>
                <Text style={messageText}>{message}</Text>
              </Section>

              <Text style={paragraph}>
                Diese E-Mail wurde über Ihr Website-Kontaktformular gesendet.
                Bitte antworten Sie direkt an{" "}
                <Link href={`mailto:${email}`} style={link}>
                  {email}
                </Link>
                .
              </Text>

              <Hr style={hr} />
              <Text style={footer}><strong>La Volotte Wolle, Filz und Glanz</strong></Text>
              <Text style={footer}>
                Haus Hersbach 1, 54570 Mürlenbach, Deutschland  <br />
                +49 (0) 241 47587794 | wolle@la-volotte.de
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ContactFormEmail;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const box = {
  padding: "0 48px",
};

const heading = {
  fontSize: "24px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "600",
  color: "#1f2937",
  padding: "17px 0 0",
  margin: "0",
};

const paragraph = {
  margin: "0 0 15px",
  fontSize: "15px",
  lineHeight: "1.4",
  color: "#374151",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "20px 0",
};

const contactInfo = {
  padding: "0",
};

const infoSection = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "24px",
  margin: "16px 0",
};

const messageSection = {
  backgroundColor: "#f3f4f6",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  padding: "24px",
  margin: "16px 0",
};

const label = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1f2937",
  margin: "0 0 8px 0",
};

const field = {
  fontSize: "15px",
  lineHeight: "1.4",
  color: "#374151",
  margin: "8px 0",
};

const messageText = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#374151",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
  wordBreak: "break-word" as const,
};

const link = {
  color: "#2563eb",
  textDecoration: "underline",
};

const footer = {
  color: "#6b7280",
  fontSize: "10px",
  lineHeight: "1.4",
  margin: "16px 0 0 0",
};
