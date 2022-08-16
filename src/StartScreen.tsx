import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Base from './Base';
import "./StartScreen.css";

export default class StartScreen extends React.Component {
    render() {
        return (
            <Base in={true}>
                <h1 className="title">Chess</h1>

                <Link to="/pvc">
                    <button className="btn" id="pvc">Player vs. Computer</button>
                </Link>

                <Link to="pvp">
                    <button className="btn" id="pvp">Player vs. Player</button>
                </Link>
            </Base >
        );
    }
}