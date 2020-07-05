import React from 'react';
import { render, fireEvent, wait } from '@testing-library/react';
import MockedAdapter from 'axios-mock-adapter';
import ResetPassword from '.';

import api from '../../services/api';

const mockedHistoryPush = jest.fn();
const mockedLocationSearch = jest.fn();
const mockedAddToast = jest.fn();

const apiMock = new MockedAdapter(api);

jest.mock('react-router-dom', () => {
  return {
    useHistory: () => ({
      push: mockedHistoryPush,
    }),
    useLocation: () => ({
      search: {
        replace: mockedLocationSearch,
      },
    }),
  };
});

jest.mock('../../hooks/toast', () => {
  return {
    useToast: () => ({
      addToast: mockedAddToast,
    }),
  };
});

describe('Reset Password Page', () => {
  beforeEach(() => {
    mockedAddToast.mockClear();
    mockedHistoryPush.mockClear();
  });

  it('should be able to reset password', async () => {
    apiMock.onPost('/password/reset').reply(200);

    mockedLocationSearch.mockImplementation(() => {
      return 'token-123';
    });

    const { getByPlaceholderText, getByText } = render(<ResetPassword />);

    const passwordField = getByPlaceholderText('Nova senha');
    const passwordConfirmationField = getByPlaceholderText(
      'Confirmação da senha',
    );
    const buttonElement = getByText('Alterar senha');

    fireEvent.change(passwordField, { target: { value: '123456' } });
    fireEvent.change(passwordConfirmationField, {
      target: { value: '123456' },
    });

    fireEvent.click(buttonElement);

    await wait(() => {
      expect(mockedHistoryPush).toHaveBeenCalledWith('/');
    });
  });

  it('should not be able to reset password with invalid token', async () => {
    apiMock.onPost('/password/reset').reply(400);

    mockedLocationSearch.mockImplementation(() => {
      return '';
    });

    const { getByPlaceholderText, getByText } = render(<ResetPassword />);

    const passwordField = getByPlaceholderText('Nova senha');
    const passwordConfirmationField = getByPlaceholderText(
      'Confirmação da senha',
    );
    const buttonElement = getByText('Alterar senha');

    fireEvent.change(passwordField, { target: { value: 123456 } });
    fireEvent.change(passwordConfirmationField, { target: { value: 123456 } });
    fireEvent.click(buttonElement);

    await wait(() => {
      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
        }),
      );
    });
  });

  it('should not be able to reset password with wrong password confirmation', async () => {
    apiMock.onPost('/password/reset').reply(400);

    mockedLocationSearch.mockImplementation(() => {
      return '';
    });

    const { getByPlaceholderText, getByText } = render(<ResetPassword />);

    const passwordField = getByPlaceholderText('Nova senha');
    const passwordConfirmationField = getByPlaceholderText(
      'Confirmação da senha',
    );
    const buttonElement = getByText('Alterar senha');

    fireEvent.change(passwordField, { target: { value: 123456 } });
    fireEvent.change(passwordConfirmationField, { target: { value: 654321 } });
    fireEvent.click(buttonElement);

    await wait(() => {
      expect(mockedHistoryPush).not.toHaveBeenCalledWith('/');
    });
  });
});
