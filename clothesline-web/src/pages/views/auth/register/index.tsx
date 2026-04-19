import Link from "next/link";
import styles from "./register.module.scss";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";

const ViewRegister = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { push, query } = useRouter();
    const callbackUrl = (query.callbackUrl as string) || "/homepage";
    const [error, setError] = useState("");
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        setError("");
        setIsLoading(true);
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const fullname = formData.get("fullname") as string;
        const password = formData.get("password") as string;
        if (!email) {
            setIsLoading(false);
            setError("Email is required");
            return
        }
        if (password.length < 6) {
            setIsLoading(false);
            setError("Password must be at least 6 characters");
            return;
        }
        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                fullname,
                password,
            }),
        });
        // const result = await response.json();
        // console.log(result);
        console.log("Response status:", response.status);
        if (response.status === 200) {
            form.reset();
            // event.currentTarget.reset();
            setIsLoading(false);
            push("/auth/login");
        } else {
            setIsLoading(false);
            setError(
                response.status === 400 ? "Email already exist" : "An error occured",
            );
        }
    };
    return (
        <div className={styles.container}>
            {error && <div className={styles.registerError}>{error}</div>}
            <div className={styles.registerCard}>
                <h1 className={styles.title}>Create Account</h1>
                <p className={styles.subtitle}>Join us to start monitoring your IoT devices.</p>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label>Full Name</label>
                        <input type="text" name="fullname" placeholder="Jamaludin" required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Email Address</label>
                        <input type="email" name="email" placeholder="name@example.com" required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Password</label>
                        <input type="password" name="password" placeholder="Type your password" required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Confirm Password</label>
                        <input type="password" name="confirmPassword" placeholder="Confirm your password" required />
                    </div>

                    <button type="submit" className={styles.signInBtn}>
                        Create Account
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
                    Already have an account? <Link href="/auth/login">Sign in here</Link>
                </p>
            </div>
        </div>
    );
};

export default ViewRegister;