import { NextRequest, NextResponse } from 'next/server';
import { communityOrganizationsService } from '@/services/communityOrganizations';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid organization ID' },
        { status: 400 }
      );
    }

    const organization = await communityOrganizationsService.getOrganizationById(id);

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: organization
    });

  } catch (error) {
    console.error('Get organization API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid organization ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updates = { ...body };

    // Remove read-only fields
    delete updates.id;
    delete updates.createdAt;

    const success = await communityOrganizationsService.updateOrganization(id, updates);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update organization or organization not found' },
        { status: 404 }
      );
    }

    const updatedOrganization = await communityOrganizationsService.getOrganizationById(id);

    return NextResponse.json({
      success: true,
      data: updatedOrganization,
      message: 'Organization updated successfully'
    });

  } catch (error) {
    console.error('Update organization API error:', error);
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}