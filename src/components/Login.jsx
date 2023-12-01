//import firebase from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import {firestore} from "../services/firebase";

function Login() {
    return (
        <div style={{ display: 'flex', flex: 1, height: '100vh' }}>
            <div style={{
                display: 'flex',
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                minWidth: 300
            }}>

                <div>

                    <button className="btn btn-primary" onClick={async () => {
                        const auth = getAuth();
                        const provider = new GoogleAuthProvider();
                        signInWithPopup(auth, provider).then((resp) => {
                            if (resp.user) {
                                //create user in firestore
                                //so that we can use user's name and photo for chat window feature.
                                //first add chatroom
                                const userObj = {
                                    displayName: resp.user.displayName,
                                    email: resp.user.email,
                                    photoURL: resp.user.photoURL
                                }

                                //setDoc - add if not there.. if already there ignore, if any change, update existing record.
                                setDoc(doc(firestore, "users",
                                resp.user.email), (userObj), { merge: true });
                            }
                        })

                    }}>
                        <span className="login-btn-image"><img alt="Google logo" className="google-icon" src="https://firebasestorage.googleapis.com/v0/b/assignment222017498.appspot.com/o/google_logo.svg?alt=media&token=40b74b3a-83c4-42f9-b62c-d06b65cd1ffd" /></span><span>Login with Google</span>
                    </button>
                </div>

            </div>
        </div>
    )
}

export default Login;