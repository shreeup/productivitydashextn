import styled from 'styled-components';

export const Input = styled.input`
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  transition: border-color 0.3s ease-in-out;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
  }
`;

export const FormContainer = styled.div`
  max-width: 500px;
  margin: 10px auto;
  padding: 20px;
  border-radius: 12px;
  background: #2c3e50;
  color: #ecf0f1;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: scale(1.02);
  }

  @media (max-width: 600px) {
    padding: 15px;
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  resize: vertical;
  transition: border-color 0.3s ease-in-out;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  transition: border-color 0.3s ease-in-out;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
  }
`;

export const Button = styled.button`
  padding: 12px;
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  background: linear-gradient(45deg, #007bff, #0056b3);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;

  &:hover {
    background: linear-gradient(45deg, #0056b3, #003d80);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(1px);
  }
`;

export const TaskListContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 20px auto;
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 600px) {
    padding: 15px;
  }
`;

export const TaskItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 10px;
  transition: all 0.3s ease-in-out;

  &:hover {
    background: #e9ecef;
  }

  button {
    margin-left: 8px;
    padding: 6px 10px;
    font-size: 14px;
    cursor: pointer;
    border: none;
    border-radius: 6px;
    transition: all 0.3s ease-in-out;

    &:hover {
      opacity: 0.8;
    }
  }

  .edit {
    background-color: #ffc107;
    color: #333;
  }

  .delete {
    background-color: #dc3545;
    color: #fff;
  }
`;
