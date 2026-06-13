import bcrypt from "bcrypt";
import userModel from "../models/user.model.js";
import crypto from "node:crypto";
import { sendVerificationEmail } from "../config/mailer.js";
import verificationModel from "../models/verification.model.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

export const registerUser = async (req, res) => {
  const { name, username, email, password } = req.body;
  const isTaken = await userModel.findOne({
    $or: [{ username }, { email }],
  });
  if (isTaken) {
    return res.status(409).json({
      message: "User with this email or password is already exist",
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const token = crypto.randomBytes(32).toString("hex");
  const user = await userModel.create({
    name,
    username,
    email,
    password: hashedPassword,
  });
  await verificationModel.create({
    userId: user._id,
    token,
  });
  const reqUrl = `${req.protocol}://${req.get("host")}`;
  try {
    await sendVerificationEmail(email, name, token, reqUrl);
  } catch (emailErr) {
    console.error("Verification email sending failed:", emailErr);
  }
  res.status(201).json({
    message: "User is registered Successfully",
    name,
    email,
  });
};

export async function verifyMe(req, res) {
  const token = req.query.token;
  const user = await verificationModel.findOne({ token });
  if (!user) {
    return res.status(403).json({
      message: "The link is invalid or expired",
    });
  }
  const realUser = await userModel.findById(user.userId);
  realUser.isVerified = true;
  await realUser.save();
  await verificationModel.deleteOne({ token });
  res.status(200).send(
    `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Successful</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap');
        
        body {
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
            font-family: 'Outfit', sans-serif;
            overflow: hidden;
        }

        .container {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            padding: 50px 40px;
            border-radius: 24px;
            border: 1px solid rgba(255, 255, 255, 0.5);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
            text-align: center;
            max-width: 400px;
            width: 90%;
            animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        h1 {
            color: #0369a1;
            font-size: 32px;
            font-weight: 800;
            margin-bottom: 10px;
            margin-top: 10px;
        }

        p {
            color: #475569;
            font-size: 16px;
            margin-bottom: 30px;
            line-height: 1.6;
        }

        .btn {
            display: inline-block;
            background: #0ea5e9;
            color: white;
            padding: 14px 32px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);
        }

        .btn:hover {
            background: #0284c7;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(14, 165, 233, 0.4);
        }

        /* Character Animations */
        .character-wrapper {
            margin-bottom: 20px;
            position: relative;
            display: inline-block;
        }

        .dancing-character {
            width: 160px;
            height: 160px;
            animation: dance 0.8s infinite alternate cubic-bezier(0.45, 0, 0.55, 1);
            transform-origin: bottom center;
        }

        .music-note {
            position: absolute;
            opacity: 0;
            color: #0284c7;
            font-size: 28px;
            font-weight: bold;
        }

        .note1 {
            top: 20px; left: -10px;
            animation: floatNotes 2s infinite linear;
        }
        
        .note2 {
            top: 40px; right: -10px;
            animation: floatNotes 2.5s infinite linear 1s;
        }

        /* Keyframes */
        @keyframes dance {
            0% { transform: scaleY(0.9) translateY(10px); }
            100% { transform: scaleY(1.05) translateY(-15px); }
        }

        @keyframes floatNotes {
            0% { transform: translateY(0) scale(0.5) rotate(-10deg); opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { transform: translateY(-60px) scale(1.2) rotate(20deg); opacity: 0; }
        }

        @keyframes popIn {
            0% { transform: scale(0.8) translateY(30px); opacity: 0; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
        }

        /* SVG Parts */
        .body { fill: #0ea5e9; }
        .belly { fill: #e0f2fe; }
        .eye { fill: #0f172a; }
        .blush { fill: #fda4af; opacity: 0.6; }
        .arm { stroke: #0ea5e9; stroke-width: 10; stroke-linecap: round; }
        
        .arm-left { transform-origin: 30% 50%; animation: waveLeft 0.5s infinite alternate ease-in-out; }
        .arm-right { transform-origin: 70% 50%; animation: waveRight 0.5s infinite alternate ease-in-out; }

        @keyframes waveLeft {
            0% { transform: rotate(-10deg); }
            100% { transform: rotate(50deg); }
        }
        @keyframes waveRight {
            0% { transform: rotate(10deg); }
            100% { transform: rotate(-50deg); }
        }
    </style>
</head>
<body>

    <div class="container">
        <div class="character-wrapper">
            <div class="music-note note1">♪</div>
            <div class="music-note note2">♫</div>
            
            <svg class="dancing-character" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <!-- Legs -->
                <line x1="80" y1="160" x2="70" y2="190" stroke="#0ea5e9" stroke-width="12" stroke-linecap="round"/>
                <line x1="120" y1="160" x2="130" y2="190" stroke="#0ea5e9" stroke-width="12" stroke-linecap="round"/>
                
          
                <g class="arm-left">
                    <line x1="50" y1="100" x2="15" y2="60" class="arm"/>
                </g>
                <g class="arm-right">
                    <line x1="150" y1="100" x2="185" y2="60" class="arm"/>
                </g>

                <!-- Body -->
                <rect x="45" y="60" width="110" height="110" rx="45" class="body"/>
                <rect x="65" y="100" width="70" height="60" rx="30" class="belly"/>

             
                <circle cx="80" cy="85" r="8" class="eye"/>
                <circle cx="120" cy="85" r="8" class="eye"/>

                
                <ellipse cx="60" cy="95" rx="10" ry="5" class="blush"/>
                <ellipse cx="140" cy="95" rx="10" ry="5" class="blush"/>

                <path d="M 85 110 Q 100 125 115 110" fill="none" stroke="#0f172a" stroke-width="6" stroke-linecap="round"/>
                
                
                <circle cx="30" cy="40" r="5" fill="#f59e0b"/>
                <circle cx="170" cy="30" r="4" fill="#f43f5e"/>
                <circle cx="160" cy="160" r="6" fill="#10b981"/>
                <circle cx="40" cy="150" r="4" fill="#8b5cf6"/>
            </svg>
        </div>

        <h1>Ohooooooooo!</h1>
        <p>You are verified successfully! You can now close this tab and start tracking your fitness journey.</p>
        
        
        <a href=https://repwise-2dq7.onrender.com/login class="btn">Take me to Login</a>
    </div>

</body>
</html>`
  );
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: "Please enter correct email or password",
    });
  }
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(401).json({
      message: "Email is not registered. Please registered first",
    });
  }
  if (user.isVerified == false) {
    return res.status(403).json({
      message: "The email is not verified. Please verified it first",
    });
  }
  const correctPassword = await bcrypt.compare(password, user.password);
  if (!correctPassword) {
    return res.status(403).json({
      message: "The password is invaid",
    });
  }

  const refreshtoken = jwt.sign({ id: user._id }, config.JWT_SECRETS, {
    expiresIn: 7 * 24 * 60 * 60,
  });
  res.cookie("refreshToken", refreshtoken, {
    httponly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
  });
  const accessToken = jwt.sign({ id: user._id }, config.JWT_SECRETS, {
    expiresIn: "15m",
  });
  res.status(200).json({
    message: `${user.name} is logged in Successfully`,
    accessToken,
  });
}

export async function refresh(req, res) {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({
      message: "The token is not present so login first",
    });
  }
  const correctToken = jwt.verify(token, config.JWT_SECRETS);
  if (!correctToken) {
    return res.status(400).json({
      message: "Token is invalid or expires",
    });
  }
  const accessToken = jwt.sign({ id: correctToken.id }, config.JWT_SECRETS, {
    expiresIn: "15m",
  });
  res.status(200).json({
    message: "The accessToken is generated",
    accessToken,
  });
}

export async function me(req, res) {
  res.status(200).json({
    success: true,
    user: req.user,
  });
}
