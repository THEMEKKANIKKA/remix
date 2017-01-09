'use strict'
var TraceManager = require('../../../babelify-src/trace/traceManager')
var CodeManager = require('../../../babelify-src/code/codeManager')
var vmSendTx = require('./vmCall')
var traceHelper = require('../../../babelify-src/helpers/traceHelper')
var util = require('../../../babelify-src/helpers/global')
var SolidityProxy = require('../../../babelify-src/solidity/solidityProxy')
var InternalCallTree = require('../../../babelify-src/util/internalCallTree')
var EventManager = require('../../../babelify-src/lib/eventManager')
var helper = require('./helper')

module.exports = function (st, vm, privateKey, contractBytecode, compilationResult, cb) {
  vmSendTx(vm, {nonce: 0, privateKey: privateKey}, null, 0, contractBytecode, function (error, txHash) {
    if (error) {
      st.fail(error)
    } else {
      util.web3.getTransaction(txHash, function (error, tx) {
        if (error) {
          st.fail(error)
        } else {
          tx.to = traceHelper.contractCreationToken('0')
          var traceManager = new TraceManager()
          var codeManager = new CodeManager(traceManager)
          codeManager.clear()
          var solidityProxy = new SolidityProxy(traceManager, codeManager)
          solidityProxy.reset(compilationResult)
          var debuggerEvent = new EventManager()
          var callTree = new InternalCallTree(debuggerEvent, traceManager, solidityProxy, codeManager, { includeLocalVariables: true })
          callTree.event.register('callTreeReady', (scopes, scopeStarts) => {
            helper.decodeLocals(st, 70, traceManager, callTree, function (locals) {
              try {
                st.equals(locals['boolFalse'], false)
                st.equals(locals['boolTrue'], true)
                st.equals(locals['testEnum'], 'three')
                st.equals(locals['sender'], '0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db')
                st.equals(locals['_bytes1'], '0x99')
                st.equals(locals['__bytes1'], '0x99')
                st.equals(locals['__bytes2'], '0x99AB')
                st.equals(locals['__bytes4'], '0x99FA0000')
                st.equals(locals['__bytes6'], '0x990000000000')
                st.equals(locals['__bytes7'], '0x99356700000000')
                st.equals(locals['__bytes8'], '0x99ABD41700000000')
                st.equals(locals['__bytes9'], '0x99156744AF00000000')
                st.equals(locals['__bytes13'], '0x99123423425300000000000000')
                st.equals(locals['__bytes16'], '0x99AFAD23432400000000000000000000')
                st.equals(locals['__bytes24'], '0x99AFAD234324000000000000000000000000000000000000')
                st.equals(locals['__bytes32'], '0x9999ABD41799ABD4170000000000000000000000000000000000000000000000')
                st.equals(Object.keys(locals).length, 16)
              } catch (e) {
                st.fail(e.message)
              }
            })

            helper.decodeLocals(st, 7, traceManager, callTree, function (locals) {
              try {
                st.equals(locals['boolFalse'], false)
                st.equals(locals['boolTrue'], false)
                st.equals(locals['testEnum'], 'one')
                st.equals(locals['sender'], '0x0000000000000000000000000000000000000000')
                st.equals(locals['_bytes1'], '0x')
                st.equals(locals['__bytes1'], '0x')
                st.equals(locals['__bytes2'], '0x')
                st.equals(locals['__bytes4'], '0x')
                st.equals(locals['__bytes6'], '0x')
                st.equals(locals['__bytes7'], '0x')
                st.equals(locals['__bytes8'], '0x')
                st.equals(locals['__bytes9'], '0x')
                st.equals(locals['__bytes13'], '0x')
                st.equals(locals['__bytes16'], '0x')
                st.equals(locals['__bytes24'], '0x')
                st.equals(locals['__bytes32'], '0x')
                st.equals(Object.keys(locals).length, 16)
              } catch (e) {
                st.fail(e.message)
              }
              cb()
            })
          })
          traceManager.resolveTrace(tx, (error, result) => {
            if (error) {
              st.fail(error)
            } else {
              debuggerEvent.trigger('newTraceLoaded', [traceManager.trace])
            }
          })
        }
      })
    }
  })
}
