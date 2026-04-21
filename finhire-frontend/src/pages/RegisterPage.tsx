import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client/react";
import { useFormik } from "formik";

import { REGISTER } from "../graphql/documents";
import { getGraphqlErrorMessage } from "../utils/graphqlErrors";


import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Alert } from "../components/ui/Alert";
import { Spinner } from "../components/ui/Spinner";
import { CountryDropdown } from "../components/ui/Auth/CountryDropdown";
import { FormField } from "../components/ui/FormField";
import { HeroPanel } from "../components/layout/HeroPanel";
import { RegisterSchema, type RegisterFormValues } from "../utils/validation";
import { RoleToggle } from "../components/ui/RoleToggle";
import { setSession } from "../auth/session";

export function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const [register] = useMutation(REGISTER);

  const formik = useFormik<RegisterFormValues>({
    initialValues: {
      name: "",
      email: "",
      password: "",
      countryCode: "",
      role: "BUSINESS",
    },
    validationSchema: RegisterSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setServerError("");
      try {
        const res: any = await register({
          variables: {
            input: {
              name: values.name,
              email: values.email,
              password: values.password,
              role: values.role,
              location: values.countryCode || null,
            },
          },
        });

        setSession(res.data.register.token, res.data.register.user.role);

        navigate("/profile", {
          replace: true,
          state: {
            email: values.email,
            notice: "Account created. Please sign in.",
          },
        });
      } catch (error) {
        setServerError(getGraphqlErrorMessage(error));
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting } = formik;

  return (
    <div className="flex min-h-screen w-full">
      <HeroPanel />

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md p-4">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="h-7 w-7 rounded-lg bg-sky-600" />
            <span className="text-sm font-semibold">FinHire</span>
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Create an account</CardTitle>
              <CardDescription>
                Already have one?{" "}
                <Link
                  to="/login"
                  className="font-medium text-violet-600 hover:underline underline-offset-4"
                >
                  Sign in
                </Link>
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
                {/* Role */}
                <FormField label="Account type" id="role">
                  <RoleToggle
                    value={values.role}
                    onChange={(v) => setFieldValue("role", v)}
                  />
                </FormField>

                {/* Name */}
                <FormField
                  label="Full name"
                  id="name"
                  error={errors.name}
                  touched={touched.name}
                >
                  <Input
                    id="name"
                    name="name"
                    placeholder="Jane Smith"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!(touched.name && errors.name)}
                    autoComplete="name"
                  />
                </FormField>

                {/* Email */}
                <FormField
                  label="Email address"
                  id="email"
                  error={errors.email}
                  touched={touched.email}
                >
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={`${values.role == "BUSINESS" ? "Work email" : "Email"}`}
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!(touched.email && errors.email)}
                    autoComplete="email"
                  />
                </FormField>

                {/* Password */}
                <FormField
                  label="Password"
                  id="password"
                  error={errors.password}
                  touched={touched.password}
                >
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!(touched.password && errors.password)}
                    autoComplete="new-password"
                  />
                </FormField>

                {/* Country */}
                <FormField
                  label="Country"
                  id="countryCode"
                  error={errors.countryCode}
                  touched={touched.countryCode}
                >
                  <CountryDropdown
                    value={values.countryCode}
                    onChange={handleChange}
                  />
                </FormField>

                {serverError && <Alert message={serverError} />}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 font-semibold"
                >
                  {isSubmitting && <Spinner className="mr-2" />}
                  {isSubmitting ? "Creating account…" : "Create account"}
                </Button>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

export default RegisterPage;