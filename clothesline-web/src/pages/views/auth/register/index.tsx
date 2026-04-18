import Link from "next/link";
import styles from "./register.module.scss";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

const ViewRegister = () => {
    return (
        <div className={styles.container}>
            <div className={styles.registerCard}>
                <h1 className={styles.title}>Create Account</h1>
                <p className={styles.subtitle}>Join us to start monitoring your IoT devices.</p>

                <form className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Full Name</label>
                        <input type="text" placeholder="Jamaludin" required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Email Address</label>
                        <input type="email" placeholder="name@example.com" required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Password</label>
                        <input type="password" placeholder="Type your password" required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Confirm Password</label>
                        <input type="password" placeholder="Confirm your password" required />
                    </div>

                    <button type="submit" className={styles.signInBtn}>
                        Create Account
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
                    Already have an account? <Link href="/auth/login">Sign in here</Link>
                </p>
            </div>
        </div>
    );
};

export default ViewRegister;