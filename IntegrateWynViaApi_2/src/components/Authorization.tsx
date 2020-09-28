import React from 'react';
import { GetAccessToken } from '../library';
import '../styles/Authorization.scss';


export default class Authorization extends React.Component<any, any> {
	constructor(props) {
		super(props);
		this.state = {
			serverURL: "",
			userName: "",
			password: "",
			error: "",
		};
	}

	onChange = (key) => (event) => {
		this.setState({ ...this.state, [key]: event.target.value });
	}

	handleSubmit = async (event) => {
		event.preventDefault();

		const { serverURL, userName, password } = this.state;
		const token = await GetAccessToken(serverURL, userName, password);

		if (token) {
			//console.log(token);
			this.props.handleSubmit(serverURL, token);
		} else {
			this.setState({ ...this.state, error: "Authorization error" });
		}
	}

	render() {
		const { serverURL, userName, error } = this.state;
		return (
			<div className="authorization">
				<div className="authorization-bg"></div>
				<div className="authorization-form">
					<div className="authorization-lock"></div>
					<form onSubmit={this.handleSubmit}>
						<div className="input-control">
							<input className="" autoFocus type="text" id="serverURL" name="serverURL" value={serverURL} onChange={this.onChange('serverURL')} placeholder="Server URL" />
						</div>
						<div className="input-control">
							<input className="" autoFocus type="text" id="username" name="username" value={userName} onChange={this.onChange('userName')} placeholder="Username" />
						</div>
						<div className="input-control">
							<input className="" type="password" id="password" name="password" onChange={this.onChange('password')} placeholder="Password" autoComplete="off" />
						</div>
						<div className="error">
							<label>{error}</label>
						</div>
						<div className="login-line">
							<button type="submit" className="btnApp">Let's go!</button>
						</div>
					</form>
				</div>
			</div>
		);
	}
}
