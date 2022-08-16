import React from "react";
import "./Base.css";

interface Props {
    in: boolean,
    children: any;
}

export default class Base extends React.Component<Props> {
    render() {
        return (
            <>
                <div className="outside">
                    <div className="mainRow">
                        <div className="col" id="leftBox"></div>
                        <div id="mainBox">
                            {this.props.in ? this.props.children : ""}
                        </div>
                        <div className="col" id="rightBox"></div>
                    </div>
                </div>

                {!this.props.in ? this.props.children : ""}
            </>
        )
    }
}