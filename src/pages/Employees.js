import React from 'react';
import {Link, Navigate} from "react-router-dom";
import Employee from "../components/minor/waiter/Employee";
import {useDispatch, useSelector} from "react-redux";
import NewEmployee from "../components/major/NewEmployee";
import Modal from "../components/minor/Modal";
import axios from "../axios";
import {fetchWaiters} from "../redux/slices/waiters";
import Loading from "../components/minor/Loading";

const Employees = () => {

    const Message = {
        body: {
            adding: {
                SUCCESS: 'Сотрудник успешно добавлен!',
                ERROR: 'Не удалось добавить сотрудника',
            },
            removing: {
                SUCCESS: 'Сотрудник успешно удален!',
                ERROR: 'Не удалось удалить сотрудника',
            }
        },
        status: {
            SUCCESS: 'success',
            ERROR: 'error',
        }

    }

    const {data: isAuth} = useSelector(store => store.auth);

    const dispatch = useDispatch();

    React.useEffect(() => {
        dispatch(fetchWaiters());
    }, []);
    const {isLoaded: isWaitersLoaded} = useSelector(store => store.waiters);

    const {waiters} = useSelector(store => store.waiters)

    const [nameToCreate, setNameToCreate] = React.useState('');
    const [dataToRemove, setDataToRemove] = React.useState({});

    const [addConfirmationShown, setAddConfirmationShown] = React.useState(false);
    const [removeConfirmationShown, setRemoveConfirmationShown] = React.useState(false);
    const [message, setMessage] = React.useState({
        message: '',
        status: ''
    });

    function showMessage(message, status) {
        setMessage({message, status});
        setTimeout(() => {
            setMessage({message: '', status: ''});
        }, 2000);
    }

    const employeesItems = waiters.map(waiter =>
        <Employee
            key={waiter.id}
            id={waiter.id}
            name={waiter.name}
            showConfirmation={() => setRemoveConfirmationShown(true)}
            setData={(id, name) => setDataToRemove({id, name})}
        />
    );

    async function createEmployee() {
        setAddConfirmationShown(false);
        setNameToCreate('');
        try {
            const response = await axios.post('/waiters', {name: nameToCreate});
            if (response.status === 200) {
                showMessage(Message.body.adding.SUCCESS, Message.status.SUCCESS);
                dispatch(fetchWaiters());
            } else {
                showMessage(Message.body.adding.ERROR, Message.status.ERROR);
            }
        } catch (e) {
            showMessage(Message.body.adding.ERROR, Message.status.ERROR);
        }
    }

    async function removeEmployee() {
        setRemoveConfirmationShown(false);
        try {
            const response = await axios.delete(`/waiters/${dataToRemove.id}`);
            if (response.status === 200) {
                showMessage(Message.body.removing.SUCCESS, Message.status.SUCCESS);
                dispatch(fetchWaiters());
            } else {
                showMessage(Message.body.removing.ERROR, Message.status.ERROR);
            }
        } catch (e) {
            showMessage(Message.body.removing.ERROR, Message.status.ERROR);
        }
    }

    if (!isAuth) {
        return <Navigate to='/login'/>;
    }

    return !isWaitersLoaded ? <Loading/> : (
        <div className="employees-list-container">
            <Link className='home-link' to='/tips'>На главную</Link>
            <div className="employees-list">
                <div className="employees-list-inner-container">
                    {employeesItems}
                </div>
            </div>
            <div style={{width: "260px"}}>
                <NewEmployee
                    showConfirm={() => setAddConfirmationShown(true)}
                    onNameChange={(event) => setNameToCreate(event.target.value)}
                    name={nameToCreate}
                />
                <p
                    className={`employees-list-message ${message.status === Message.status.ERROR ? 'error' : ''}`}
                >
                    {message.message}
                </p>

            </div>
            {addConfirmationShown &&
                <Modal
                    text={`Добавить ${nameToCreate} в список сотрудников?`}
                    onConfirm={createEmployee}
                    onCancel={() => setAddConfirmationShown(false)}
                />
            }
            {removeConfirmationShown &&
                <Modal
                    text={`Удалить ${dataToRemove.name} из списка сотрудников?`}
                    onConfirm={removeEmployee}
                    onCancel={() => setRemoveConfirmationShown(false)}
                />
            }
        </div>
    );
};

export default Employees;