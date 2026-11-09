import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/data/teamMembers.json');

function readTeamData(): any[] {
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent);
    }
  } catch (e) {
    console.error('Error reading teamMembers.json', e);
  }
  return [];
}

function writeTeamData(data: any[]) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const data = readTeamData();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to read team data', details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const newMember = await req.json();
    const data = readTeamData();

    if (!newMember.id) {
      newMember.id = newMember.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    if (!newMember.slug) {
      newMember.slug = newMember.id;
    }
    if (newMember.isActive === undefined) {
      newMember.isActive = true;
    }
    if (newMember.sortOrder === undefined) {
      newMember.sortOrder = data.length + 1;
    }

    if (!newMember.structuredCv) {
      newMember.structuredCv = {
        summary: newMember.bio || '',
        education: newMember.education ? [{ degree: newMember.education, institution: '', year: '' }] : [],
        registrations: newMember.registrations || [],
        software: newMember.software || [],
        experience: newMember.experience || [],
      };
    }

    data.push(newMember);
    writeTeamData(data);

    return NextResponse.json({ success: true, member: newMember }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to save team member', details: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const updatedMember = await req.json();
    const data = readTeamData();

    const idx = data.findIndex(
      (m: any) => m.id === updatedMember.id || (m.slug && m.slug === updatedMember.slug)
    );

    if (idx !== -1) {
      data[idx] = {
        ...data[idx],
        ...updatedMember,
      };
      writeTeamData(data);
      return NextResponse.json({ success: true, member: data[idx] });
    } else {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update team member', details: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id query parameter' }, { status: 400 });
    }

    const data = readTeamData();
    const filtered = data.filter((m: any) => m.id !== id && m.slug !== id);

    if (filtered.length === data.length) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    writeTeamData(filtered);
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete team member', details: error.message }, { status: 500 });
  }
}
