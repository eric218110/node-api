import { Decrypter } from '@data/protocols/criptography/decrypter'
import { DbLoadAccountByToken } from './db-load-account-by-token'
import { AccountModel } from '../account/db-add-account-protocols'
import { LoadAccountByTokenRepository } from '@data/protocols/data/account/load-by-token-repository'

type SutTypes = {
  decrypterStub: Decrypter
  sut: DbLoadAccountByToken
  loadAccoutByTokenRepositoryStub: LoadAccountByTokenRepository
  fakeAccountModel: AccountModel
  fakeToken: string
  fakeRole: string
}

const makeFakeToken = 'any_token'

const makeFakeRole = 'any_role'

const makeFakeAccountModel = (): AccountModel => ({
  id: 'any_id',
  email: 'any_email',
  name: 'any_name',
  password: 'any_password'
})

const makeDecrypterStub = (): Decrypter => {
  class DecrypterStub implements Decrypter {
    async decrypt (values: string): Promise<string> {
      return new Promise(resolve => resolve('decrypted_value'))
    }
  }
  return new DecrypterStub()
}

const makeLoadAccoutByTokenRepositoryStub =
(fakeAccountModel: AccountModel): LoadAccountByTokenRepository => {
  class LoadAccoutByTokenRepositoryStub implements LoadAccountByTokenRepository {
    async loadByToken (values: string, role: string): Promise<AccountModel> {
      return new Promise(resolve => resolve(fakeAccountModel))
    }
  }
  return new LoadAccoutByTokenRepositoryStub()
}

const makeSut = (): SutTypes => {
  const fakeToken = makeFakeToken
  const fakeRole = makeFakeRole
  const fakeAccountModel = makeFakeAccountModel()
  const loadAccoutByTokenRepositoryStub = makeLoadAccoutByTokenRepositoryStub(fakeAccountModel)
  const decrypterStub = makeDecrypterStub()
  const sut = new DbLoadAccountByToken(decrypterStub, loadAccoutByTokenRepositoryStub)
  return {
    sut,
    decrypterStub,
    loadAccoutByTokenRepositoryStub,
    fakeAccountModel,
    fakeToken,
    fakeRole
  }
}

describe('DbLoadAccountByToken', () => {
  test('should call Decrypter with correct values', async () => {
    const { sut, decrypterStub, fakeToken } = makeSut()
    const decryptSpy = jest.spyOn(decrypterStub, 'decrypt')
    await sut.load(fakeToken, makeFakeRole)
    expect(decryptSpy).toHaveBeenCalledWith(fakeToken)
  })

  test('should return null if Decrypter returns null', async () => {
    const { sut, decrypterStub, fakeRole, fakeToken } = makeSut()
    jest.spyOn(decrypterStub, 'decrypt')
      .mockReturnValueOnce(new Promise(resolve => resolve(null)))
    const account = await sut.load(fakeToken, fakeRole)
    expect(account).toBeNull()
  })

  test('should call LoadAccoutByTokenRepository with correct values', async () => {
    const { sut, loadAccoutByTokenRepositoryStub, fakeToken, fakeRole } = makeSut()
    const loadByTokenSpy = jest.spyOn(loadAccoutByTokenRepositoryStub, 'loadByToken')
    await sut.load(fakeToken, fakeRole)
    expect(loadByTokenSpy).toHaveBeenCalledWith('decrypted_value', fakeRole)
  })
})
