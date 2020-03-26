import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import Container from '../../components/container/index';
import api from '../../services/api';

import { Loading, Owner, IssueList, Pagination } from './styles';

export default class Repository extends Component {
    // eslint-disable-next-line react/static-property-placement
    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                repository: PropTypes.string,
            }),
        }).isRequired,
    };

    // eslint-disable-next-line react/state-in-constructor
    state = {
        repository: {},
        issues: [],
        loading: true,
        filter: 'open',
        disableNext: false,
        disableBack: true,
        page: 1,
    };

    async componentDidMount() {
        const { match } = this.props;

        const repoName = decodeURIComponent(match.params.repository);

        const [repositories, issues] = await Promise.all([
            api.get(`/repos/${repoName}`, {
                headers: {
                    Accept: 'application/vnd.github.scarlet-witch-preview+json',
                },
            }),
            api.get(`/repos/${repoName}/issues`, {
                headers: {
                    Accept: 'application/vnd.github.scarlet-witch-preview+json',
                },

                params: {
                    state: this.state.filter,
                    per_page: 5,
                    page: this.state.page,
                },
            }),
        ]);

        this.setState({
            repository: repositories.data,
            issues: issues.data,
            loading: false,
        });
    }

    handleOptionChange = async (e) => {
        try {
            this.setState({ filter: e.target.value });

            const { repository, filter, page } = this.state;
            const issues = await api.get(
                `/repos/${repository.full_name}/issues`,
                {
                    headers: {
                        Accept:
                            'application/vnd.github.scarlet-witch-preview+json',
                    },
                    params: {
                        state: filter,
                        per_page: 5,
                        page,
                    },
                }
            );

            this.setState({
                issues: issues.data,
                loading: false,
            });
        } catch (e) {
            console.log(e);
        }
    };

    handleNextPage = async (e) => {
        console.log('Call function');
        const { repository, filter, page } = this.state;
        let newPage = 1;
        if (page === 1) {
            newPage = 2;
            this.setState({
                loading: true,
                disableNext: true,
                disableBack: false,
            });
        } else {
            newPage = 1;
            this.setState({
                loading: true,
                disableNext: false,
                disableBack: true,
            });
        }

        const issues = await api.get(`/repos/${repository.full_name}/issues`, {
            headers: {
                Accept: 'application/vnd.github.scarlet-witch-preview+json',
            },
            params: {
                state: filter,
                per_page: 5,
                page: newPage,
            },
        });

        this.setState({
            issues: issues.data,
            loading: false,
            page: newPage,
        });
    };

    render() {
        const {
            repository,
            issues,
            loading,
            disableNext,
            disableBack,
        } = this.state;
        if (loading) return <Loading>Aguarde</Loading>;
        console.log(disableNext);
        console.log(disableBack);
        return (
            <Container>
                <Owner>
                    <Link to="/"> Voltar para os repositórios </Link>
                    <img
                        src={repository.owner.avatar_url}
                        alt={repository.owner.login}
                    />
                    <h1>{repository.name}</h1>
                    <p>{repository.description}</p>
                    <div>
                        <input
                            type="radio"
                            name="issueState"
                            value="all"
                            onChange={this.handleOptionChange}
                        />
                        <label htmlFor="all">all</label>
                        <input
                            type="radio"
                            name="issueState"
                            value="open"
                            onChange={this.handleOptionChange}
                        />
                        <label htmlFor="open">open</label>
                        <input
                            type="radio"
                            name="issueState"
                            value="closed"
                            onChange={this.handleOptionChange}
                        />
                        <label htmlFor="closed">closed</label>
                    </div>
                </Owner>
                <IssueList>
                    {issues.map((issue) => (
                        <li key={String(issue.id)}>
                            <img
                                src={issue.user.avatar_url}
                                alt={issue.user.login}
                            />
                            <div>
                                <strong>
                                    <a href={issue.html_url}>{issue.title}</a>
                                    {issue.labels.map((label) => (
                                        <span key={String(label.id)}>
                                            {label.name}
                                        </span>
                                    ))}
                                </strong>
                                <p>{issue.user.login}</p>
                            </div>
                        </li>
                    ))}
                </IssueList>
                <Pagination>
                    <button
                        disabled={disableBack}
                        onClick={() => this.handleNextPage()}
                    >
                        Anterior
                    </button>
                    <button
                        disabled={disableNext}
                        onClick={() => this.handleNextPage()}
                    >
                        Proximo
                    </button>
                </Pagination>
            </Container>
        );
    }
}
