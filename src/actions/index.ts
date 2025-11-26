// actions/index.ts
import { Resend } from "resend";
import { getSecret } from "astro:env/server";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import ContactFormEmail from "@/components/emails/contactFormEmail";

const resend = new Resend(getSecret("RESEND_API_KEY"));

export const server = {
  contactForm: defineAction({
    accept: "form",
    input: z.object({
      // Honeypot field - optional (can be null, undefined, or string)
      a_password: z.union([z.string(), z.null(), z.undefined()]).transform(val => val || "").default(""),
      // Required fields
      firstName: z
        .string({
          required_error: "Vorname ist erforderlich",
          invalid_type_error: "Vorname muss Text sein",
        })
        .trim()
        .min(1, "Vorname ist erforderlich")
        .max(100, "Vorname ist zu lang"),
      email: z
        .string({
          required_error: "E-Mail-Adresse ist erforderlich",
          invalid_type_error: "E-Mail-Adresse muss Text sein",
        })
        .trim()
        .min(1, "E-Mail-Adresse ist erforderlich")
        .email("Bitte geben Sie eine gültige E-Mail-Adresse ein")
        .max(255, "E-Mail-Adresse ist zu lang"),
      message: z
        .string({
          required_error: "Nachricht ist erforderlich",
          invalid_type_error: "Nachricht muss Text sein",
        })
        .trim()
        .min(1, "Nachricht ist erforderlich")
        .min(10, "Nachricht muss mindestens 10 Zeichen lang sein")
        .max(5000, "Nachricht ist zu lang"),
      // Optional fields (can be null, undefined, or string)
      lastName: z
        .union([z.string(), z.null(), z.undefined()])
        .transform(val => (val || "").toString().trim())
        .refine(val => val.length <= 100, "Nachname ist zu lang")
        .default(""),
      phone: z
        .union([z.string(), z.null(), z.undefined()])
        .transform(val => (val || "").toString().trim())
        .refine(val => val.length <= 50, "Telefonnummer ist zu lang")
        .default(""),
    }),
    handler: async (formData, context) => {
      console.log("=== CONTACT FORM HANDLER ===");
      console.log("Received data:", formData);
      
      // Honeypot check
      if (formData.a_password && formData.a_password.trim() !== "") {
        console.warn("Spam detected via honeypot");
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Ungültige Anfrage erkannt",
        });
      }
      
      // Additional validation (if needed)
      if (!formData.firstName || !formData.email || !formData.message) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Pflichtfelder fehlen",
        });
      }
      
      try {
        console.log("Attempting to send email...");
        
        const emailResult = await resend.emails.send({
          from: "LV <mail@mohankumar.dev>",
          to: "mohansky@gmail.com",
          subject: `Neue Anfrage von ${formData.firstName} ${formData.lastName || ""}`.trim(),
          react: ContactFormEmail({
            firstName: formData.firstName,
            lastName: formData.lastName || "",
            email: formData.email,
            phone: formData.phone || "",
            message: formData.message,
          }),
        });
        
        if (emailResult.error) {
          console.error("Resend API error:", emailResult.error);
          throw new ActionError({
            code: "INTERNAL_SERVER_ERROR",
            message: "E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.",
          });
        }
        
        console.log("Email sent successfully:", emailResult.data);
        
        return {
          success: true,
          message: "Nachricht erfolgreich gesendet",
          emailId: emailResult.data?.id,
        };
      } catch (error) {
        console.error("Email sending failed:", error);
        
        if (error instanceof ActionError) {
          throw error;
        }
        
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Ein Fehler ist beim Senden der E-Mail aufgetreten. Bitte versuchen Sie es später erneut.",
        });
      }
    },
  }),
};