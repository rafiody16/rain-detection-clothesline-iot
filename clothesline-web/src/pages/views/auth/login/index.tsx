import Link from "next/link";
import styles from "./login.module.scss";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";

const ViewLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { push, query } = useRouter();
    const callbackUrl = (query.callbackUrl as string) || "/homepage";
    const [error, setError] = useState("");
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setIsLoading(true);
        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        try {
            const res = await signIn("credentials", {
                redirect: false,
                email,
                password,
                callbackUrl,
            });

            // console.log("SignIn response:", res);
            if (!res?.error) {
                setIsLoading(false);
                push("/homepage");
            } else {
                setIsLoading(false);
                // console.log("Login error:", res.error);
                setError(res?.error || "Login failed");
            }
        } catch (error) {
            setIsLoading(false);
            setError("Wrong email or password");
        }

    };
    return (
        <div className={styles.container}>
            {error && <p className={styles.loginError}>{error}</p>}
            <div className={styles.loginCard}>
                <h1 className={styles.title}>Welcome Back</h1>
                <p className={styles.subtitle}>Please enter your details to sign in.</p>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label>Email</label>
                        <input type="email" name="email" placeholder="Enter your email" required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Password</label>
                        <input type="password" name="password" placeholder="Enter your password" required />
                    </div>
                    <button type="submit" className={styles.signInBtn}>
                        Sign In
                    </button>
                </form>

                <div className={styles.divider}>
                    <span>OR</span>
                </div>

                <div className={styles.oauthGroup}>
                    <button
                        className={styles.oauthBtn}
                        onClick={() => signIn("google", { callbackUrl, redirect: false })}
                        disabled={isLoading}
                        type="button"
                    >
                        <FcGoogle size={20} />
                        <span>Continue with Google</span>
                    </button>
                    <button
                        className={styles.oauthBtn}
                        onClick={() => signIn("github", { callbackUrl, redirect: false })}
                        disabled={isLoading}
                        type="button"
                    >
                        <FaGithub size={20} />
                        <span>Continue with GitHub</span>
                    </button>
                </div>

                <p className={styles.footerText}>
                    Don't have an account? <Link href="/auth/register">Sign up here</Link>
                </p>
            </div>
        </div>
    )
}

export default ViewLogin;