import React, { Component } from "react";
import MyProvider from "./CarsProvider";
import { ProductList } from "./ProductList";

export default class TestingContext extends Component {
    render() {
        return (
            <MyProvider>
                <div className="App" style={{ position: "relative", left: '50px' }}>
                    <header className="App-header">
                        <h1 className="App-title">Welcome to my web store</h1>
                    </header>
                    <ProductList />
                </div>
            </MyProvider>
        );
    }
}