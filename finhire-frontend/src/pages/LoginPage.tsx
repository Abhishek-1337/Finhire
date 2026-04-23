import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client/react";
import { useFormik } from "formik";

import { LOGIN } from "../graphql/documents";
import { getGraphqlErrorMessage } from "../utils/graphqlErrors";


import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Alert } from "../components/ui/Alert";
import { Spinner } from "../components/ui/Spinner";
import { FormField } from "../components/ui/FormField";
import { HeroPanel } from "../components/layout/HeroPanel";
import { LoginSchema, type LoginFormValues } from "../utils/validation";
import { setSession } from "../auth/session";

export function LoginPage() {
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const [login] = useMutation(LOGIN);

  const formik = useFormik<LoginFormValues>({
    initialValues: {
      email: "",
      password: ""
    },
    validationSchema: LoginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setServerError("");
      try {
        const res:any = await login({
          variables: {
            input: {
              email: values.email,
              password: values.password,
            },
          },
        });

        setSession(res.data.login.token, res.data.login.user.role);

        navigate("/seach", {
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
              <CardTitle>Log in</CardTitle>
              <CardDescription>
                Don't have one?{" "}
                <Link
                  to="/register"
                  className="font-medium text-violet-600 hover:underline underline-offset-4"
                >
                  Register
                </Link>
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">

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
                    placeholder="Email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!(touched.email && errors.email)}
                    autoComplete="email"
                  />
                </FormField>

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

                {serverError && <Alert message={"Something went wrong."} />}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 font-semibold"
                >
                  {isSubmitting && <Spinner className="mr-2" />}
                  {isSubmitting ? "..."  : "Log in"}
                </Button>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

export default LoginPage;