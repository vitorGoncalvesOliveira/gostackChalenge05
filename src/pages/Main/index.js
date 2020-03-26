import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Container from '../../components/container/index';
import { Form, SubmitButton, List } from './styles';
import api from '../../services/api';

export default class Main extends Component {
    // eslint-disable-next-line react/state-in-constructor
    state = {
        newRepo: '',
        repositories: [],
        loading: false,
        error: false,
    };

    componentDidMount() {
        const repository = localStorage.getItem('repositories');
        if (repository) {
            this.setState({ repositories: JSON.parse(repository) });
        }
    }

    componentDidUpdate(_, prevState) {
        const { repositories } = this.state;

        if (prevState.repositories !== repositories) {
            localStorage.setItem('repositories', JSON.stringify(repositories));
        }
    }

    handleInputChange = (e) => {
        this.setState({ newRepo: e.target.value });
    };

    handleSubmit = async (e) => {
        e.preventDefault();

        const { newRepo, repositories } = this.state;
        this.setState({ loading: true });
        try {
            const repoAlreadyExist = repositories.find(
                (repository) => repository.name === newRepo
            );

            if (repoAlreadyExist) throw new Error('Repositório já existe');

            const response = await api.get(`/repos/${newRepo}`, {
                headers: {
                    Accept: 'application/vnd.github.scarlet-witch-preview+json',
                },
            });

            const data = {
                name: response.data.full_name,
            };

            this.setState({
                repositories: [...repositories, data],
                newRepo: '',
                loading: false,
            });
        } catch (e) {
            console.log({ e });
            this.setState({
                loading: false,
                error: true,
            });
        }
    };

    render() {
        const { newRepo, loading, repositories, error } = this.state;
        return (
            <Container>
                <h1>
                    <FaGithubAlt />
                    Repósitorios
                </h1>
                <Form onSubmit={this.handleSubmit} error={error}>
                    <input
                        type="text"
                        placeholder="Adicionar repósitorio"
                        onChange={this.handleInputChange}
                        value={newRepo}
                    />
                    <SubmitButton loading={loading}>
                        {loading ? (
                            <FaSpinner color="#fff" size={14} />
                        ) : (
                            <FaPlus color="#fff" size={14} />
                        )}
                    </SubmitButton>
                </Form>
                <List>
                    {repositories.map((repository) => (
                        <li key={repository.name}>
                            <span>{repository.name}</span>
                            <Link
                                to={`/repository/${encodeURIComponent(
                                    repository.name
                                )}`}
                            >
                                Detalhes
                            </Link>
                        </li>
                    ))}
                </List>
            </Container>
        );
    }
}
