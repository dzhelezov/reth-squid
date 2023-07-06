import {In} from 'typeorm'
import {assertNotNull} from '@subsquid/evm-processor'
import {TypeormDatabase} from '@subsquid/typeorm-store'
import * as erc20 from './abi/erc20'
import {Approval, Transfer} from './model'
import {Block, CONTRACT_ADDRESS, Context, Log, Transaction, processor} from './processor'

processor.run(new TypeormDatabase({supportHotBlocks: true}), async (ctx) => {
    let transfers: Transfer[] = []
    let approvals: Approval[] = []
    for (let block of ctx.blocks) {
        for (let log of block.logs) {
            if (log.address === CONTRACT_ADDRESS && log.topics[0] === erc20.events.Transfer.topic) {
                transfers.push(getTransfer(ctx, log))
            }
            if (log.address === CONTRACT_ADDRESS && log.topics[0] === erc20.events.Approval.topic) {
                approvals.push(getApproval(ctx, log))
            }
        }
    }
    //await ctx.store.insert(transfers)
    //await ctx.store.insert(approvals)
})


function getTransfer(ctx: Context, log: Log): Transfer {
    let event = erc20.events.Transfer.decode(log)

    let spender = event.from.toLowerCase()
    let receiver = event.to.toLowerCase()
    let amount = event.value

    return new Transfer({
        id: log.id,
        spender,
        receiver,
        amount
    })
}


function getApproval(ctx: Context, log: Log): Approval {
    let event = erc20.events.Approval.decode(log)

    let owner = event.owner.toLowerCase()
    let spender = event.spender.toLowerCase()
    let value = event.value

    return new Approval({
        id: log.id,
        owner,
        spender,
        value
    })
}



