/* eslint-disable react-hooks/rules-of-hooks */

import { useCallback as CwCoreHooks } from 'react'
import { useRecoilValueLoadable } from 'recoil'

import { validateCwCoreInstantiateMsg } from '@dao-dao/utils'

import { CwCoreClient as ExecuteClient } from '../../clients/cw-core'
import {
  ExecuteClientParams,
  executeClient,
} from '../../recoil/selectors/clients/cw-core'
import { FunctionKeyOf } from '../../types'

const wrapExecuteHook =
  <T extends FunctionKeyOf<ExecuteClient>>(fn: T) =>
  (params: ExecuteClientParams) => {
    const clientLoadable = useRecoilValueLoadable(executeClient(params))
    const client =
      clientLoadable.state === 'hasValue' ? clientLoadable.contents : undefined

    return CwCoreHooks(
      (...args: Parameters<ExecuteClient[T]>) => {
        if (client)
          return (
            client[fn] as (
              ...args: Parameters<ExecuteClient[T]>
            ) => ReturnType<ExecuteClient[T]>
          )(...args)
        throw new Error('Client undefined.')
      },
      [client]
    )
  }

export const useExecuteAdminMsgs = wrapExecuteHook('executeAdminMsgs')
export const useExecuteProposalHook = wrapExecuteHook('executeProposalHook')
export const usePause = wrapExecuteHook('pause')
export const useUpdateAdmin = wrapExecuteHook('updateAdmin')
export const useUpdateConfig = wrapExecuteHook('updateConfig')
export const useUpdateVotingModule = wrapExecuteHook('updateVotingModule')
export const useUpdateProposalModules = wrapExecuteHook('updateProposalModules')
export const useSetItem = wrapExecuteHook('setItem')
export const useRemoveItem = wrapExecuteHook('removeItem')
export const useReceive = wrapExecuteHook('receive')
export const useReceiveNft = wrapExecuteHook('receiveNft')
export const useUpdateCw20List = wrapExecuteHook('updateCw20List')
export const useUpdateCw721List = wrapExecuteHook('updateCw721List')

type ParametersExceptFirst<F> = F extends (arg0: any, ...rest: infer R) => any
  ? R
  : never
interface UseInstantiateParams
  extends Omit<ExecuteClientParams, 'contractAddress'> {
  codeId: number
}
export const useInstantiate = ({ codeId, ...params }: UseInstantiateParams) => {
  const clientLoadable = useRecoilValueLoadable(
    // contractAddress irrelevant when instantiating a new contract.
    executeClient({ ...params, contractAddress: '' })
  )
  const client =
    clientLoadable.state === 'hasValue' ? clientLoadable.contents : undefined

  return CwCoreHooks(
    (...args: ParametersExceptFirst<ExecuteClient['instantiate']>) => {
      validateCwCoreInstantiateMsg(args[0])

      if (client) return client.instantiate(codeId, ...args)
      throw new Error('Client undefined.')
    },
    [client, codeId]
  )
}