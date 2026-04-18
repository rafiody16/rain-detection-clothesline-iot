import Link from "next/link";
import styles from "./login.module.scss";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

const ViewLogin = () => {
    return (
        <div className={styles.container}>
            <div className={styles.loginCard}>
                <h1 className={styles.title}>Welcome Back</h1>
                <p className={styles.subtitle}>Please enter your details to sign in.</p>

                <form className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Email</label>
                        <input type="email" placeholder="Enter your email" required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Password</label>
                        <input type="password" placeholder="Enter your password" required />
                    </div>
                    <button type="submit" className={styles.signInBtn}>
                        Sign In
                    </button>
                </form>

                <div className={styles.divider}>
                    <span>OR</span>
                </div>

                <div className={styles.oauthGroup}>
                    <button className={styles.oauthBtn}>
                        <FcGoogle size={20} />
                        <span>Continue with Google</span>
                    </button>
                    <button className={styles.oauthBtn}>
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