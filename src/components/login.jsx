import React, { useState } from "react";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BeatLoader from "react-spinners/BeatLoader";
import Error from "@/components/error";
import * as Yup from "yup";
import { login as loginApi } from "@/db/apiAuth";
import { useNavigate, useSearchParams } from "react-router-dom";

const Login = () => {
  const [errors, setErrors] = useState({});
  const [formData, setFormData ] = useState ({ email: "", password: "",});
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const longLink = searchParams.get("createNew");

  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setFormData ((prevState) => ({ ...prevState, [name] : value,}))
  };

  const handleLogin = async () => {
    // Reset errors vider la liste des erreurs
    setErrors({});
    setNetworkError(null);

    try {
        //  validation email et mot de passe avec Yup
      const schema = Yup.object().shape({
        email: Yup.string().email("Invalid Email").required("Email is required"),
        password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
      })
      await schema.validate(formData, {abortEarly: false});

      // appel supabase
      setLoading(true);
      await loginApi(formData); // { user, session }

      navigate(`/dashboard${longLink ? `?createNew=${longLink}` : ""}`);


    } catch (e) {

      // Erreurs Yup (input par input)
      if (e?.inner?.length) {
        const fieldErrors = {};
        e.inner.forEach((err) => { fieldErrors[err.path] = err.message; });
        setErrors(fieldErrors);
      } else {
        // Erreur Supabase / réseau
        setNetworkError(e.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>To your accoiunt if already have onen</CardDescription>
          {networkError && <Error message={networkError} />}
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Input
              name="email"
              type="email"
              placeholder="Enter Email"
              value ={formData.email}
              onChange={handleInputChange}
            />
           {errors.email && <Error message={errors.email} />}
          </div>
          <div className="space-y-1">
            <Input
              name="password"
              type="password"
              placeholder="Enter password"
              value ={formData.password}
              onChange={handleInputChange}
            />
           {errors.password && <Error message={errors.password} />}

          </div>
        </CardContent>

        <CardFooter>
          <Button onClick={handleLogin} disabled={loading}>
            {loading ? < BeatLoader size={10} color="#36d7b7"/> : "Login"}
          </Button>
        </CardFooter>
      </Card>
  )
};

export default Login;
