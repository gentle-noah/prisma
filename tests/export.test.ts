import test from 'ava'
import TestResolver from '../src/system/TestResolver'
const fetchMock = require('fetch-mock')
const debug = require('debug')('graphcool')
import 'isomorphic-fetch'
import exportCommand from '../src/commands/export'
import {systemAPIEndpoint, graphcoolProjectFileName, graphcoolConfigFilePath} from '../src/utils/constants'
import {

} from './mock_data/mockData'
import {SystemEnvironment} from '../src/types'
import TestOut from '../src/system/TestOut'
import {mockedExportResponse} from './mock_data/mockData'
import {mockedPullProjectFile1} from './mock_data/mockData'

test.afterEach(() => {
  fetchMock.restore()
})

/*
 Tests:
- Export without project file but passing project ID as argument
- Export with project file
- Export with multiple project files
 */

test('Export without project file but passing project ID as argument', async t => {

  // configure HTTP mocks
  const mockedResponse = JSON.parse(mockedExportResponse)
  fetchMock.post(systemAPIEndpoint, mockedResponse)

  // dummy export data
  const env = testEnvironment({})
  env.resolver.write(graphcoolConfigFilePath, '{"token": ""}')
  const sourceProjectId = "cj26898xqm9tz0126n34d64ey"
  const props = { sourceProjectId }

  await t.notThrows(
    exportCommand(props, env)
  )
})

test('Export with project file', async t => {

  // configure HTTP mocks
  const mockedResponse = JSON.parse(mockedExportResponse)
  fetchMock.post(systemAPIEndpoint, mockedResponse)

  // dummy export data
  const env = testEnvironment({})
  const projectFile = 'example.graphcool'
  env.resolver.write(projectFile, mockedPullProjectFile1)
  env.resolver.write(graphcoolConfigFilePath, '{"token": ""}')
  const props = { projectFile }

  await t.notThrows(
    exportCommand(props, env)
  )
})

test('Export with multiple project files', async t => {

  // configure HTTP mocks
  const mockedResponse = JSON.parse(mockedExportResponse)
  fetchMock.post(systemAPIEndpoint, mockedResponse)

  // dummy export data
  const env = testEnvironment({})
  const projectFile1 = 'example.graphcool'
  const projectFile2 = graphcoolProjectFileName
  env.resolver.write(projectFile1, mockedPullProjectFile1)
  env.resolver.write(projectFile2, mockedPullProjectFile1)
  env.resolver.write(graphcoolConfigFilePath, '{"token": ""}')
  const props = { }

  await t.throws(
    exportCommand(props, env)
  )
})

function testEnvironment(storage: any): SystemEnvironment {
  return {
    resolver: new TestResolver(storage),
    out: new TestOut()
  }
}
